const Evaluation = require('../models/Evaluation');
const EvaluationResult = require('../models/EvaluationResult');
const AnswerSheet = require('../models/AnswerSheet');

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard statistics
// @access  Private (Teacher)
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const evaluations = await Evaluation.find({ teacherId });
    const totalEvaluations = evaluations.length;
    
    const pendingEvaluations = evaluations.filter(e => e.status !== 'completed').length;
    const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;

    // To calculate average score, we get all results for this teacher's evaluations
    const evalIds = evaluations.map(e => e._id);
    const results = await EvaluationResult.find({ evaluationId: { $in: evalIds } });

    let averageScore = 0;
    if (results.length > 0) {
      const totalScore = results.reduce((acc, curr) => acc + (curr.finalScore || 0), 0);
      averageScore = (totalScore / results.length).toFixed(2);
    }

    // Mock AI Accuracy for now, would be dynamically calculated if we track Human overrides
    const aiAccuracy = 94.5;

    res.status(200).json({
      totalEvaluations,
      pendingEvaluations,
      completedEvaluations,
      averageScore,
      aiAccuracy
    });

  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
};

// @route   GET /api/student/reports
// @desc    Get all reports for the logged-in student
// @access  Private (Student)
const getStudentReports = async (req, res) => {
  try {
    // Assuming the student login gives us a unique identifier or the frontend sends it
    // For this example, we'll try to match by student _id or email if we stored it in AnswerSheet
    // Alternatively, if AnswerSheet doesn't have student login ID implicitly, we pretend we do:
    const studentIdentifier = req.user.userId; // This is the JWT user ID

    // Let's assume the upload process tags sheets with studentIdentifier
    // Or we just fetch dummy data if not truly linked yet.
    // Real flow:
    // AnswerSheet.find({ studentIdentifier }) -> Get results for those sheets
    
    // For demonstration, we'll just fetch results that have a populated match
    const sheets = await AnswerSheet.find({ studentIdentifier });
    const sheetIds = sheets.map(s => s._id);

    const results = await EvaluationResult.find({ sheetId: { $in: sheetIds } }).populate('evaluationId');

    const formattedReports = results.map(res => {
      const evalObj = res.evaluationId || {};
      return {
        id: res._id,
        examTitle: evalObj.examTitle || 'Unknown Exam',
        subject: evalObj.subject || 'Unknown Subject',
        marks: res.finalScore || res.aiScore,
        totalMarks: evalObj.totalMarks || 100,
        feedback: res.feedback || 'No feedback provided',
        evaluationDate: res.createdAt
      };
    });

    res.status(200).json({
      reports: formattedReports
    });

  } catch (error) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({ message: 'Server error fetching student reports.' });
  }
};

module.exports = {
  getTeacherDashboard,
  getStudentReports
};
