const express = require('express');
const router = express.Router();
const { auth, isStudent, isInstructor, isAdmin } = require('../middleware/auth');
const { 
    initiateChat,
    getStudentChats,
    getInstructorChats,
    getAllChats,
    archiveChat,
    flagChat,
    deleteChat,
    sendMessage,
    getChatMessages,
    hideMessage,
    getChatDetails
} = require('../controllers/chat');

// Multer middleware for handling file uploads
const { upload } = require('../middleware/multer');

// ================ STUDENT ROUTES ================
router.post('/initiate', auth, isStudent, initiateChat);
router.get('/student/chats', auth, isStudent, getStudentChats);

// ================ INSTRUCTOR ROUTES ================
router.get('/instructor/chats', auth, isInstructor, getInstructorChats);

// ================ ADMIN ROUTES ================
router.get('/admin/chats', auth, isAdmin, getAllChats);
router.patch('/admin/archive/:chatId', auth, isAdmin, archiveChat);
router.patch('/admin/unarchive/:chatId', auth, isAdmin, require('../controllers/chat').unarchiveChat);
router.patch('/admin/flag/:chatId', auth, isAdmin, flagChat);
router.patch('/admin/unflag/:chatId', auth, isAdmin, require('../controllers/chat').unflagChat);
router.delete('/admin/delete/:chatId', auth, isAdmin, deleteChat);
router.patch('/admin/hide-message/:messageId', auth, isAdmin, hideMessage);

// ================ COMMON ROUTES ================
// Send message (with optional image upload)
router.post('/message', auth, upload.single('image'), sendMessage);

// Get messages for a chat
router.get('/messages/:chatId', auth, getChatMessages);

// Get chat details
router.get('/details/:chatId', auth, getChatDetails);

module.exports = router;
