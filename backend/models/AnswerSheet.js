const mongoose = require('mongoose');

const answerSheetSchema = new mongoose.Schema({
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
    required: true
  },
  studentIdentifier: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadStatus: {
    type: String,
    default: 'uploaded'
  }
}, { timestamps: true });

module.exports = mongoose.model('AnswerSheet', answerSheetSchema);
