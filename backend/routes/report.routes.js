const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher, requireStudent } = require('../middleware/authMiddleware');
const { getTeacherDashboard, getStudentReports } = require('../controllers/report.controller');

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard statistics
router.get('/teacher/dashboard', requireAuth, requireTeacher, getTeacherDashboard);

// @route   GET /api/student/reports
// @desc    Get all reports for the logged-in student
router.get('/student/reports', requireAuth, requireStudent, getStudentReports);

module.exports = router;
