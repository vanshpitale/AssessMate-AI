const Evaluation = require('../models/Evaluation');
const AnswerSheet = require('../models/AnswerSheet');
const EvaluationResult = require('../models/EvaluationResult');
const aiJobService = require('../services/aiJob.service');

// @route   POST /api/evaluations
// @desc    Create a new evaluation (Teacher only)
// @access  Private (Teacher)
const createEvaluation = async (req, res) => {
  try {
    const { subject, semester, examTitle, examType, section, totalMarks } = req.body;
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

module.exports = {
  createEvaluation,
  runAIEvaluation,
  getEvaluationStatus
};
