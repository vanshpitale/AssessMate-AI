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
  try {
    const { id } = req.params;
    const teacherId = req.user.userId;

    // 1. Validate user & evaluation
    const evaluation = await Evaluation.findOne({ _id: id, teacherId });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found or unauthorized.' });
    }

    // Retrieve questions from the evaluation stored in database
    let evalQuestions = evaluation.questions;
    if (!evalQuestions || !Array.isArray(evalQuestions) || evalQuestions.length === 0) {
      // Fallback to req.body.questions if not present in database
      const { questions } = req.body;
      if (questions && Array.isArray(questions) && questions.length > 0) {
        evalQuestions = questions;
      } else {
        return res.status(400).json({ message: 'No questions defined for this evaluation. Please define them first.' });
      }
    }

    // 2. Fetch uploaded sheets
    const sheets = await AnswerSheet.find({ evaluationId: id });
    if (!sheets || sheets.length === 0) {
      return res.status(400).json({ message: 'No answer sheets found for this evaluation.' });
    }

    // Update status to processing
    evaluation.status = 'processing';
    await evaluation.save();

    const evaluationResults = [];

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      let tempImagePaths = [];

      try {
        // 3. Resolve absolute file path from stored fileUrl
        let filePathStr = sheet.fileUrl;
        if (filePathStr.startsWith('http')) {
          const parts = filePathStr.split('/uploads/');
          if (parts.length > 1) filePathStr = parts[1];
        } else if (filePathStr.startsWith('/uploads/')) {
          filePathStr = filePathStr.replace('/uploads/', '');
        }

        const absoluteFilePath = path.join(__dirname, '..', 'uploads', filePathStr);

        if (!fs.existsSync(absoluteFilePath)) {
          throw new Error(`Uploaded file not found: ${filePathStr}`);
        }

        // 4. Detect file type and build imageParts for Gemini
        let imageParts = [];
        const ext = path.extname(absoluteFilePath).toLowerCase();
        const tempDir = path.join(__dirname, '..', 'temp_images');

        if (ext === '.pdf') {
          console.log(`[Gemini] PDF detected. Converting to images for sheet ${sheet._id}…`);
          tempImagePaths = await convertPdfToImages(absoluteFilePath, tempDir);

          if (tempImagePaths.length === 0) {
            throw new Error('PDF conversion produced no images.');
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

        // Format questions for Gemini service: { id, max, modelAnswer }
        const formattedQuestionsForGemini = evalQuestions.map(q => ({
          id: q.id,
          max: q.max,
          modelAnswer: q.modelAnswer
        }));

        const totalMarks = evalQuestions.reduce((sum, q) => sum + (q.max || 0), 0);

        // 5. Call Gemini
        console.log(`[Gemini] Calling Gemini evaluation for sheet ${sheet._id}...`);
        const resultObj = await evaluateWithGemini({ imageParts, questions: formattedQuestionsForGemini, totalMarks });

        // Backend Validation
        if (!resultObj || typeof resultObj !== 'object') {
          throw new Error('Gemini response is not a valid object');
        }

        const evalQuestionsMap = new Map();
        let calculatedMax = 0;
        evalQuestions.forEach(q => {
          evalQuestionsMap.set(q.id, q);
          calculatedMax += q.max;
        });

        let calculatedScore = 0;
        const validatedQuestions = [];
        const geminiQuestions = Array.isArray(resultObj.questions) ? resultObj.questions : [];

        geminiQuestions.forEach((qResult) => {
          if (!qResult.id) return;
          
          // Match by original question ID from the database evaluation questions
          const originalQuestion = evalQuestionsMap.get(qResult.id);
          if (!originalQuestion) return; // skip unrecognized question IDs

          let score = Number(qResult.score);
          if (isNaN(score) || score < 0) score = 0;
          if (score > originalQuestion.max) {
            score = originalQuestion.max; // cap score at max allowed
          }

          const max = originalQuestion.max;
          let confidence = Number(qResult.confidence);
          if (isNaN(confidence) || confidence < 0) confidence = 0.5;
          if (confidence > 1) confidence = 1.0;

          const feedback = typeof qResult.feedback === 'string' ? qResult.feedback.trim() : 'No feedback provided.';

          calculatedScore += score;
          validatedQuestions.push({
            id: qResult.id,
            score,
            max,
            confidence,
            feedback
          });
        });

        // Fill in missing questions that Gemini didn't return
        evalQuestions.forEach(q => {
          const found = validatedQuestions.some(vq => vq.id === q.id);
          if (!found) {
            validatedQuestions.push({
              id: q.id,
              score: 0,
              max: q.max,
              confidence: 1.0,
              feedback: 'Question was not answered or not detected in the sheet.'
            });
          }
        });

        const overallMax = calculatedMax;
        const overallScore = calculatedScore;
        const confidence = typeof resultObj.confidence === 'number' ? resultObj.confidence : 0.8;
        const gradingSummary = typeof resultObj.gradingSummary === 'string' ? resultObj.gradingSummary.trim() : 'Evaluation completed.';

        // Delete duplicate result for this sheet if it already exists
        await EvaluationResult.deleteOne({ sheetId: sheet._id, evaluationId: evaluation._id });

        // 6. Store result in DB
        const evalResult = new EvaluationResult({
          sheetId: sheet._id,
          evaluationId: evaluation._id,
          overallScore,
          overallMax,
          confidence,
          aiScore: overallScore,
          finalScore: overallScore, // default to AI score
          questions: validatedQuestions,
          feedback: gradingSummary,
          status: 'pending',
        });
        await evalResult.save();

        evaluationResults.push(evalResult);

        // 7. Cleanup temp images (PDF path only)
        if (tempImagePaths.length > 0) {
          cleanupTempImages(tempImagePaths);
        }
      } catch (sheetError) {
        console.error(`[Gemini] Error evaluating sheet ${sheet._id}:`, sheetError.message);
        if (tempImagePaths.length > 0) {
          cleanupTempImages(tempImagePaths);
        }
        throw sheetError; // throw up to abort transaction/run and notify teacher
      }
    }

    // Update status to completed
    evaluation.status = 'completed';
    await evaluation.save();

    // 8. Respond
    return res.status(200).json({
      status: 'completed',
      evaluationId: evaluation._id,
      results: evaluationResults,
    });

  } catch (error) {
    console.error('[Gemini] Error running Gemini evaluation:', error);
    // Mark status back to uploading so teacher can retry
    try {
      const { id } = req.params;
      await Evaluation.findByIdAndUpdate(id, { status: 'uploading' });
    } catch (dbErr) {
      console.error('Failed resetting status:', dbErr.message);
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
