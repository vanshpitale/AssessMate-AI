// StudentDataStore.js - Mock data for student portal
// This will be replaced with backend API calls in the future

const MOCK_STUDENT = {
  id: 'S12345',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@ves.ac.in',
  rollNumber: 'MCA2024001',
  course: 'MCA',
  semester: '2nd Semester',
  institute: 'VESIT, MCA',
};

const MOCK_EVALUATIONS = [
  {
    id: 'eval_1',
    name: 'Data Structures - Mid Term',
    subject: 'Data Structures',
    date: '2026-01-15',
    totalMarks: 50,
    obtainedMarks: 42,
    status: 'graded',
    feedback: 'Excellent understanding of concepts. Keep up the good work!',
    questions: [
      { id: 'q1', question: 'Explain Binary Search Tree', maxMarks: 10, obtainedMarks: 9, feedback: 'Well explained' },
      { id: 'q2', question: 'Implement Stack using Array', maxMarks: 10, obtainedMarks: 8, feedback: 'Minor syntax error' },
      { id: 'q3', question: 'Time complexity analysis', maxMarks: 10, obtainedMarks: 10, feedback: 'Perfect!' },
      { id: 'q4', question: 'Linked List operations', maxMarks: 10, obtainedMarks: 8, feedback: 'Good attempt' },
      { id: 'q5', question: 'Graph traversal', maxMarks: 10, obtainedMarks: 7, feedback: 'Needs improvement' },
    ],
  },
  {
    id: 'eval_2',
    name: 'Database Management - Assignment 1',
    subject: 'DBMS',
    date: '2026-01-28',
    totalMarks: 30,
    obtainedMarks: 27,
    status: 'graded',
    feedback: 'Great SQL queries. Work on normalization concepts.',
    questions: [
      { id: 'q1', question: 'SQL Queries', maxMarks: 15, obtainedMarks: 14, feedback: 'Excellent queries' },
      { id: 'q2', question: 'Normalization', maxMarks: 15, obtainedMarks: 13, feedback: 'Minor mistakes in 3NF' },
    ],
  },
  {
    id: 'eval_3',
    name: 'Web Development - Lab Test',
    subject: 'Web Development',
    date: '2026-02-05',
    totalMarks: 25,
    obtainedMarks: null,
    status: 'pending',
    feedback: null,
    questions: [],
  },
];

export function getStudentInfo() {
  return MOCK_STUDENT;
}

export function getStudentResults() {
  return MOCK_EVALUATIONS;
}

export function getResultById(id) {
  return MOCK_EVALUATIONS.find(evaluation => evaluation.id === id);
}

export function getStudentStats() {
  const graded = MOCK_EVALUATIONS.filter(e => e.status === 'graded');
  const totalEvaluations = MOCK_EVALUATIONS.length;
  
  if (graded.length === 0) {
    return {
      totalEvaluations,
      averageScore: 0,
      recentResults: [],
    };
  }

  const totalObtained = graded.reduce((sum, e) => sum + e.obtainedMarks, 0);
  const totalMax = graded.reduce((sum, e) => sum + e.totalMarks, 0);
  const averageScore = Math.round((totalObtained / totalMax) * 100);

  const recentResults = graded
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return {
    totalEvaluations,
    averageScore,
    recentResults,
  };
}
