const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require('../controllers/notification');

// Get user's notifications
router.get('/get-notifications', auth, getUserNotifications);

// Mark notification as read
router.post('/mark-as-read', auth, markNotificationAsRead);

// Mark all notifications as read
router.post('/mark-all-as-read', auth, markAllNotificationsAsRead);

// Delete notification
router.delete('/delete', auth, deleteNotification);

module.exports = router;
