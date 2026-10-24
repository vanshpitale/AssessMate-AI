const Evaluation = require('../models/Evaluation');
const AnswerSheet = require('../models/AnswerSheet');
const EvaluationResult = require('../models/EvaluationResult');
const aiJobService = require('../services/aiJob.service');
const { evaluateWithGemini, fileToGenerativePart, getMimeType } = require('../services/gemini.service');
const { convertPdfToImages, imageToBase64, cleanupTempImages } = require('../utils/pdfToImage');
const path = require('path');
const fs = require('fs');

// @route   POST /api/evaluations
// @desc    Create a new evaluation (Teacher only)
// @access  Private (Teacher)
const createEvaluation = async (req, res) => {
  try {
    const { subject, semester, examTitle, examType, section, totalMarks, questions } = req.body;
    const teacherId = req.user.userId;

    if (!subject || !semester || !examTitle || !examType || !section || !totalMarks) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const evaluation = new Evaluation({
      teacherId,
      subject,
      semester,
      examTitle,
      examType,
      section,
      totalMarks,
      questions: questions || [],
      status: 'created'
    });

    await evaluation.save();

    res.status(201).json({
      message: 'Evaluation created successfully',
      evaluationId: evaluation._id,
      evaluation
    });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ message: 'Server error creating evaluation.' });
  }
};

// @route   POST /api/evaluations/:evaluationId/run-ai
// @desc    Trigger AI processing for the uploaded sheets
// @access  Private (Teacher)
const runAIEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    // Verify ownership
    const evaluation = await Evaluation.findOne({ _id: evaluationId, teacherId });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found or unauthorized.' });
    }

    if (evaluation.status === 'processing') {
      return res.status(400).json({ message: 'Evaluation is already processing.' });
    }

    // Fetch sheets
    const sheets = await AnswerSheet.find({ evaluationId });
    if (!sheets || sheets.length === 0) {
      return res.status(400).json({ message: 'No answer sheets found for this evaluation.' });
    }

    // Update status to processing
    evaluation.status = 'processing';
    await evaluation.save();

    // In a real production setup, we'd add this to a background queue (like BullMQ)
    // For this implementation, we can run it asynchronously
    const fileUrls = sheets.map(sheet => sheet.fileUrl);
    
    // Asynchronous processing (non-blocking) - we don't await so the request completes quickly
    processAIEvaluationAsync(evaluation, sheets, fileUrls).catch(console.error);

    res.status(200).json({
      message: 'AI evaluation job started successfully.',
      status: 'processing'
    });

  } catch (error) {
    console.error('Error starting AI evaluation:', error);
    res.status(500).json({ message: 'Server error starting AI evaluation.' });
  }
};

// Helper for Background Processing
const processAIEvaluationAsync = async (evaluation, sheets, fileUrls) => {
  try {
    // Call the external python AI Microservice
    const aiResponse = await aiJobService.triggerAIEvaluation(evaluation._id, fileUrls);
    
    // Assuming aiResponse looks like:
    // { results: [ { sheetId: 'fileUrl_or_id', aiScore: 85, confidence: 0.9, feedback: 'Good job' } ] }
    const results = aiResponse.results || [];
    
    // Process results
    const resultPromises = results.map(async (aiResult) => {
      // Basic matching (AI needs to return sheetId that correlates to our DB)
      // Here we assume aiResult.sheetId matches our db sheet._id or the file name
      // If it doesn't map exactly, we need lookup logic. For simplicity, we assume exact ID mapping:
      let matchingSheet = sheets.find(s => s._id.toString() === aiResult.sheetId || s.fileUrl === aiResult.sheetId);
      
      // Fallback: simply associate in order if mapping is broken (not recommended for prod)
      if (!matchingSheet && results.length === sheets.length) {
        matchingSheet = sheets[results.indexOf(aiResult)];
      }
      
      if (matchingSheet) {
        const evalResult = new EvaluationResult({
          sheetId: matchingSheet._id,
          evaluationId: evaluation._id,
          aiScore: aiResult.aiScore,
          finalScore: aiResult.aiScore, // default final score to AI score
          confidence: aiResult.confidence,
          feedback: aiResult.feedback,
          status: 'pending' // teacher needs to verify
        });
        return evalResult.save();
      }
    });

    await Promise.all(resultPromises);

    // Update evaluation status
    evaluation.status = 'completed';
    await evaluation.save();
    console.log(`Evaluation ${evaluation._id} completed successfully.`);

  } catch (error) {
    console.error(`AI background job failed for evaluation ${evaluation._id}:`, error.message);
    // Depending on logic, might set status to 'failed' or back to 'uploading'
  }
};

// @route   GET /api/evaluations/:evaluationId/status
// @desc    Get the status of an evaluation
// @access  Private (Teacher)
const getEvaluationStatus = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, teacherId });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found.' });
    }

    const totalSheets = await AnswerSheet.countDocuments({ evaluationId });
    const evaluatedSheets = await EvaluationResult.countDocuments({ evaluationId });

    res.status(200).json({
      status: evaluation.status,
      totalSheets,
      evaluatedSheets
    });
  } catch (error) {
    console.error('Error getting evaluation status:', error);
    res.status(500).json({ message: 'Server error retrieving status.' });
  }
};

// @route   POST /api/evaluations/:id/run-gemini
// @desc    Trigger Gemini multimodal AI processing directly (supports PDF + images)
// @access  Private (Teacher)
const runGeminiEvaluation = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.userId;

  try {
    // 1. Atomic status check & lock: prevent concurrent evaluations for the same evaluation (Step 17)
    const lockedEval = await Evaluation.findOneAndUpdate(
      { _id: id, teacherId, status: { $ne: 'processing' } },
      { status: 'processing' },
      { returnDocument: 'after' }
    );

    if (!lockedEval) {
      const existing = await Evaluation.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Evaluation not found.' });
      }
      if (existing.teacherId.toString() !== teacherId.toString()) {
        return res.status(403).json({ message: 'Unauthorized. You do not own this evaluation.' });
      }
      if (existing.status === 'processing') {
        return res.status(409).json({ message: 'Evaluation is currently being processed. Please wait.' });
      }
      return res.status(400).json({ message: `Cannot run evaluation in current status: ${existing.status}` });
    }

    // 2. Authoritative questions from database (Step 8)
    const evalQuestions = lockedEval.questions;
    if (!evalQuestions || !Array.isArray(evalQuestions) || evalQuestions.length === 0) {
      await Evaluation.findByIdAndUpdate(id, { status: 'failed' });
      return res.status(400).json({ message: 'No questions defined for this evaluation. Please define questions and model answers first.' });
    }

    // Format questions for Gemini service: include id, questionText, modelAnswer, max
    const formattedQuestionsForGemini = evalQuestions.map(q => ({
      id: q.id,
      questionText: q.questionText || '',
      modelAnswer: q.modelAnswer,
      max: Number(q.max) || 0
    }));

    const totalMarks = evalQuestions.reduce((sum, q) => sum + (Number(q.max) || 0), 0);

    // 3. Fetch uploaded answer sheets (Step 5)
    const sheets = await AnswerSheet.find({ evaluationId: id });
    if (!sheets || sheets.length === 0) {
      await Evaluation.findByIdAndUpdate(id, { status: 'failed' });
      return res.status(400).json({ message: 'No answer sheets found for this evaluation. Please upload answer sheets first.' });
    }

    const evaluationResults = [];

    // 4. Process each student sheet individually (Step 19: multi-student isolation)
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      let tempImagePaths = [];

      try {
        // Resolve absolute file path from stored fileUrl
        let filePathStr = sheet.fileUrl;
        if (filePathStr.startsWith('http')) {
          const parts = filePathStr.split('/uploads/');
          if (parts.length > 1) filePathStr = parts[1];
        } else if (filePathStr.startsWith('/uploads/')) {
          filePathStr = filePathStr.replace('/uploads/', '');
        }

        const absoluteFilePath = path.join(__dirname, '..', 'uploads', filePathStr);

        if (!fs.existsSync(absoluteFilePath)) {
          throw new Error(`Uploaded file not found on disk: ${filePathStr}`);
        }

        let imageParts = [];
        const ext = path.extname(absoluteFilePath).toLowerCase();
        const tempDir = path.join(__dirname, '..', 'temp_images');

        if (ext === '.pdf') {
          console.log(`[Gemini] PDF detected. Converting to images for sheet ${sheet._id}...`);
          tempImagePaths = await convertPdfToImages(absoluteFilePath, tempDir);

          if (!tempImagePaths || tempImagePaths.length === 0) {
            throw new Error('PDF conversion produced no page images.');
          }

          imageParts = tempImagePaths.map((imgPath) => ({
            inlineData: {
              data: imageToBase64(imgPath),
              mimeType: 'image/png',
            },
          }));
        } else {
          const mimeType = getMimeType(absoluteFilePath);
          imageParts = [fileToGenerativePart(absoluteFilePath, mimeType)];
        }

        // 5. Call Gemini service with bounded retry and strict validation (Step 13, 14, 15)
        console.log(`[Gemini] Calling Gemini evaluation for sheet ${sheet._id} (${imageParts.length} page/image parts)...`);
        const validatedResult = await evaluateWithGemini({
          imageParts,
          questions: formattedQuestionsForGemini,
          totalMarks
        });

        // Delete previous result for this sheet if re-running
        await EvaluationResult.deleteOne({ sheetId: sheet._id, evaluationId: lockedEval._id });

        // 6. Persist validated result in database (Step 18)
        const evalResult = new EvaluationResult({
          sheetId: sheet._id,
          evaluationId: lockedEval._id,
          overallScore: validatedResult.overallScore,
          overallMax: validatedResult.overallMax,
          confidence: validatedResult.confidence,
          aiScore: validatedResult.overallScore,
          finalScore: validatedResult.overallScore,
          questions: validatedResult.questions,
          feedback: validatedResult.gradingSummary,
          status: 'pending',
        });
        await evalResult.save();

        evaluationResults.push(evalResult);

      } finally {
        // Guaranteed cleanup of temporary converted page PNGs; original PDF remains untouched (Step 18, 25)
        if (tempImagePaths && tempImagePaths.length > 0) {
          cleanupTempImages(tempImagePaths);
        }
      }
    }

    // 7. Update evaluation status to completed (Step 16)
    lockedEval.status = 'completed';
    await lockedEval.save();

    // 8. Return response
    return res.status(200).json({
      status: 'completed',
      evaluationId: lockedEval._id,
      results: evaluationResults,
    });

  } catch (error) {
    console.error('[Gemini] Error running Gemini evaluation:', error);
    // Mark status to failed so evaluation is not stuck in processing (Step 16)
    try {
      await Evaluation.findByIdAndUpdate(id, { status: 'failed' });
    } catch (dbErr) {
      console.error('Failed setting evaluation status to failed:', dbErr.message);
    }
    res.status(500).json({ message: 'Server error processing Gemini evaluation: ' + error.message });
  }
};

// @route   GET /api/evaluations/:evaluationId/results
// @desc    Get results for a specific evaluation (Teacher only)
// @access  Private (Teacher)
const getEvaluationResults = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    // Verify evaluation ownership
    const evaluation = await Evaluation.findOne({ _id: evaluationId, teacherId });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found or unauthorized.' });
    }

    // Fetch evaluation results
    const results = await EvaluationResult.find({ evaluationId })
      .populate('sheetId')
      .exec();

    res.status(200).json({
      evaluation,
      results
    });
  } catch (error) {
    console.error('Error fetching evaluation results:', error);
    res.status(500).json({ message: 'Server error fetching evaluation results.' });
  }
};

// @route   GET /api/evaluations
// @desc    Get all evaluations for the logged-in teacher
// @access  Private (Teacher)
const getTeacherEvaluations = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const evaluations = await Evaluation.find({ teacherId }).sort({ createdAt: -1 });
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error fetching teacher evaluations:', error);
    res.status(500).json({ message: 'Server error retrieving evaluations.' });
  }
};

module.exports = {
  createEvaluation,
  runAIEvaluation,
  getEvaluationStatus,
  runGeminiEvaluation,
  getEvaluationResults,
  getTeacherEvaluations
};
