const express = require('express');
const router = express.Router();

// Import controllers
const {
    getFeaturedCourses,
    updateFeaturedCourses
} = require('../controllers/featuredCourses');

// Import middleware
const { auth, isAdmin } = require('../middleware/auth');

// ================ FEATURED COURSES ROUTES ================
// Get featured courses (public route)
router.get('/', getFeaturedCourses);

// Update featured courses (admin only)
router.post('/update', auth, isAdmin, updateFeaturedCourses);

module.exports = router;
