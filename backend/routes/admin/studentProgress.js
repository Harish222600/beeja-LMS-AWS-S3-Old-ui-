const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../../middleware/auth');
const { 
  getStudentsByCourse,
  getStudentProgress
} = require('../../controllers/admin/studentProgress');

// Get all students enrolled in a course
router.get('/courses/:courseId/students', auth, isAdmin, getStudentsByCourse);

// Get detailed progress for a student in a course
router.get('/courses/:courseId/students/:studentId/progress', auth, isAdmin, getStudentProgress);

module.exports = router;
