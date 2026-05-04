const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  examTitle: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'uploading', 'processing', 'completed'],
    default: 'created'
  }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
