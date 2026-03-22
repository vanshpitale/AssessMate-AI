const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

const {
  createEvaluation,
  runAIEvaluation,
  getEvaluationStatus
} = require('../controllers/evaluation.controller');

// @route   POST /api/evaluations
// @desc    Create a new evaluation (Teacher only)
router.post('/', requireAuth, requireTeacher, createEvaluation);

// @route   POST /api/evaluations/:evaluationId/run-ai
// @desc    Trigger AI processing for the uploaded sheets
router.post('/:evaluationId/run-ai', requireAuth, requireTeacher, runAIEvaluation);

// @route   GET /api/evaluations/:evaluationId/status
// @desc    Get the status of an evaluation
router.get('/:evaluationId/status', requireAuth, requireTeacher, getEvaluationStatus);

module.exports = router;
