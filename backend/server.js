require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for mobile compatibility during local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const path = require('path');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Built-in Health Check Route
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'AssessMate AI Backend Running' }));

// Routes
const evaluationRoutes = require('./routes/evaluation.routes');
const uploadRoutes = require('./routes/upload.routes');
const reportRoutes = require('./routes/report.routes');

app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/evaluations', uploadRoutes); // Reusing evaluations prefix for /:evaluationId/upload
app.use('/api', reportRoutes); // /teacher/dashboard and /student/reports

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assessmate';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
