const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer.middleware');
const { uploadAnswerSheets } = require('../controllers/upload.controller');

// @route   POST /api/evaluations/:evaluationId/upload
// @desc    Upload answer sheets (images or PDFs)
router.post('/:evaluationId/upload', requireAuth, requireTeacher, upload.array('files', 50), uploadAnswerSheets);

module.exports = router;
