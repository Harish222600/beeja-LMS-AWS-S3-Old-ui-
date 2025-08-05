const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz');

// Import middleware
const { auth, isInstructor, isStudent, isAdmin } = require('../middleware/auth');
const {
  createQuiz,
  updateQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizResults,
  validateSectionAccess,
  submitQuiz,
  getQuizStatus
} = require('../controllers/quiz');

// Routes
router.get('/all', auth, getAllQuizzes);
router.post('/create', auth, (req, res, next) => {
  // Allow both admin and instructor to create quizzes
  if (req.user.accountType === 'Admin' || req.user.accountType === 'Instructor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins and instructors can create quizzes.'
    });
  }
}, createQuiz);
router.get('/status/:quizId', auth, getQuizStatus);
router.get('/results/:quizId', auth, getQuizResults);
router.get('/validate-access/:sectionId', auth, validateSectionAccess);
router.get('/:quizId', auth, getQuizById);
router.put('/update/:quizId', auth, (req, res, next) => {
  // Allow both admin and instructor to update quizzes
  if (req.user.accountType === 'Admin' || req.user.accountType === 'Instructor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins and instructors can update quizzes.'
    });
  }
}, updateQuiz);
router.post('/submit', auth, submitQuiz);

module.exports = router;
