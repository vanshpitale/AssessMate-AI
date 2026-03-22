const express = require('express');
const router = express.Router();
const { teacherLogin, studentLogin, teacherRegister, studentRegister, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// @route   POST /api/auth/teacher-login
// @desc    Login a teacher and return JWT
// @access  Public
router.post('/teacher-login', teacherLogin);

// @route   POST /api/auth/student-login
// @desc    Login a student and return JWT
// @access  Public
router.post('/student-login', studentLogin);

// @route   POST /api/auth/teacher-register
// @desc    Register a teacher and return JWT
// @access  Public
router.post('/teacher-register', teacherRegister);

// @route   POST /api/auth/student-register
// @desc    Register a student and return JWT
// @access  Public
router.post('/student-register', studentRegister);

// @route   GET /api/auth/me
// @desc    Get current user profile (Teacher or Student)
// @access  Private (Requires valid token)
router.get('/me', requireAuth, getMe);

module.exports = router;
