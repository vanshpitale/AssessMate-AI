const mongoose = require('mongoose');

const evaluationResultSchema = new mongoose.Schema({
  sheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnswerSheet',
    required: true
  },
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
    required: true
  },
  aiScore: {
    type: Number,
    required: true
  },
  finalScore: {
    type: Number
  },
  confidence: {
    type: Number
  },
  feedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('EvaluationResult', evaluationResultSchema);
