const Evaluation = require('../models/Evaluation');
const AnswerSheet = require('../models/AnswerSheet');

// @route   POST /api/evaluations/:evaluationId/upload
// @desc    Upload answer sheets (images or PDFs)
// @access  Private (Teacher)
const uploadAnswerSheets = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const files = req.files; // Array of files from multer
    const teacherId = req.user.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files provided for upload.' });
    }

    // Verify evaluation exists and is owned by teacher
    const evaluation = await Evaluation.findOne({ _id: evaluationId, teacherId });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found or unauthorized.' });
    }

    if (evaluation.status === 'processing' || evaluation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot upload sheets to an evaluation that is processing or completed.' });
    }

    // Process each uploaded file and create AnswerSheet records
    const sheetPromises = files.map(file => {
      // In a real-world scenario, we'd also upload this to S3/Cloud Storage
      // Here we just save the local path relative to the backend
      const fileUrl = `/uploads/${file.filename}`;
      
      const newSheet = new AnswerSheet({
        evaluationId,
        fileUrl,
        fileType: file.mimetype,
        uploadStatus: 'uploaded'
      });
      return newSheet.save();
    });

    await Promise.all(sheetPromises);

    // Update evaluation status
    evaluation.status = 'uploading';
    await evaluation.save();

    res.status(200).json({
      message: `${files.length} answer sheet(s) uploaded successfully.`,
      evaluationStatus: evaluation.status
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
};

module.exports = {
  uploadAnswerSheets
};
