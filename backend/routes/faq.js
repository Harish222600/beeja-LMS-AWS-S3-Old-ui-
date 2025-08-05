const express = require('express');
const router = express.Router();

const {
    submitQuestion,
    getAllFaqs,
    getPublishedFaqs,
    answerFaq,
    togglePublishStatus,
    deleteFaq
} = require('../controllers/faq_simple');

const { auth, isAdmin } = require('../middleware/auth');

// Public route - get published FAQs
router.get('/published', getPublishedFaqs);

// Protected routes - require authentication
router.post('/ask', auth, submitQuestion);

// Admin only routes
router.get('/all', auth, isAdmin, getAllFaqs);
router.put('/answer/:id', auth, isAdmin, answerFaq);
router.put('/toggle-publish/:id', auth, isAdmin, togglePublishStatus);
router.delete('/delete/:id', auth, isAdmin, deleteFaq);

module.exports = router;
