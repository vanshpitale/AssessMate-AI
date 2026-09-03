const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher, requireStudent } = require('../middleware/authMiddleware');
const { getTeacherDashboard, getStudentReports, getTeacherAnalytics, getStudentReportDetail } = require('../controllers/report.controller');

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard statistics
router.get('/teacher/dashboard', requireAuth, requireTeacher, getTeacherDashboard);

// @route   GET /api/teacher/analytics
// @desc    Get teacher class performance analytics
router.get('/teacher/analytics', requireAuth, requireTeacher, getTeacherAnalytics);

// @route   GET /api/student/reports
// @desc    Get all reports for the logged-in student
router.get('/student/reports', requireAuth, requireStudent, getStudentReports);

// @route   GET /api/student/reports/:id
// @desc    Get detailed result by ID (Student only)
router.get('/student/reports/:id', requireAuth, requireStudent, getStudentReportDetail);

module.exports = router;
