const express = require('express');
const router = express.Router();

// Import controllers
const { getUserAnalytics, getUserActivity, updateWatchTime } = require('../controllers/userAnalytics');

// Import middleware
const { auth } = require('../middleware/auth');

// Routes for user analytics
router.get('/analytics', auth, getUserAnalytics);
router.get('/activity', auth, getUserActivity);
router.post('/update-watch-time', auth, updateWatchTime);

module.exports = router;
