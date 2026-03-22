const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Helper to generate JWT
const generateToken = (userId, role, name) => {
  return jwt.sign(
    { userId, role, name },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
};

// Teacher Login
const teacherLogin = async (req, res) => {
  try {
    const { email_or_enrollment, password } = req.body;

    if (!email_or_enrollment || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find teacher by email
    const teacher = await Teacher.findOne({ email: email_or_enrollment });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(teacher._id, teacher.role, teacher.name);

    res.status(200).json({
      token,
      userId: teacher._id,
      role: teacher.role,
      name: teacher.name,
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Student Login
const studentLogin = async (req, res) => {
  try {
    const { email_or_enrollment, password } = req.body;

    if (!email_or_enrollment || !password) {
      return res.status(400).json({ message: 'Email/Enrollment ID and password are required' });
    }

    // Find student by email OR enrollmentId
    const student = await Student.findOne({
      $or: [
        { email: email_or_enrollment },
        { enrollmentId: email_or_enrollment }
      ]
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(student._id, student.role, student.name);

    res.status(200).json({
      token,
      userId: student._id,
      role: student.role,
      name: student.name,
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Teacher Registration
const teacherRegister = async (req, res) => {
  try {
    const { name, email, password, institute, department } = req.body;

    if (!name || !email || !password || !institute || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newTeacher = new Teacher({
      name,
      email,
      password_hash,
      institute,
      department
    });

    await newTeacher.save();
    
    // Auto-login upon registration
    const token = generateToken(newTeacher._id, newTeacher.role, newTeacher.name);

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newTeacher._id,
      role: newTeacher.role,
      name: newTeacher.name,
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Student Registration
const studentRegister = async (req, res) => {
  try {
    const { name, email, password, enrollmentId, section, institute } = req.body;

    if (!name || !email || !password || !enrollmentId || !section || !institute) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing email OR enrollment ID
    const existingStudent = await Student.findOne({
      $or: [{ email }, { enrollmentId }]
    });

    if (existingStudent) {
      if (existingStudent.email === email) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      return res.status(409).json({ message: 'Enrollment ID already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      name,
      email,
      password_hash,
      enrollmentId,
      section,
      institute
    });

    await newStudent.save();

    // Auto-login upon registration
    const token = generateToken(newStudent._id, newStudent.role, newStudent.name);

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newStudent._id,
      role: newStudent.role,
      name: newStudent.name,
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// (Optional) Test Route to verify token
const getMe = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(req.user.userId).select('-password_hash');
      return res.json(teacher);
    } else if (req.user.role === 'student') {
      const student = await Student.findById(req.user.userId).select('-password_hash');
      return res.json(student);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  teacherLogin,
  studentLogin,
  teacherRegister,
  studentRegister,
  getMe,
};
