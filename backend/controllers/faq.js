const FAQ = require('../models/faq');
const User = require('../models/user');
const { createEnhancedNotification } = require('./notification');

// Submit a new FAQ question
exports.submitQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required'
            });
        }

        const faq = await FAQ.create({
            question,
            userId
        });

        // Notify admins about new question
        await createEnhancedNotification({
            title: 'New FAQ Question',
            message: `A new FAQ question has been submitted: "${question.substring(0, 50)}..."`,
            recipientType: 'Admin',
            type: 'GENERAL',
            priority: 'medium',
            metadata: {
                questionId: faq._id,
                submittedBy: userId
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Question submitted successfully',
            faq
        });
    } catch (error) {
        console.error('Error in submitQuestion:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all FAQs (admin only)
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            faqs
        });
    } catch (error) {
        console.error('Error in getAllFaqs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get published FAQs
exports.getPublishedFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ 
            isPublished: true,
            status: 'answered'
        }).sort({ answeredAt: -1 });

        return res.status(200).json({
            success: true,
            faqs
        });
    } catch (error) {
        console.error('Error in getPublishedFaqs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Answer FAQ (admin only)
exports.answerFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({
                success: false,
                message: 'Answer is required'
            });
        }

        const faq = await FAQ.findById(id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        faq.answer = answer;
        faq.status = 'answered';
        faq.answeredAt = new Date();
        await faq.save();

        // Notify user that their question was answered
        await createEnhancedNotification({
            title: 'FAQ Answered',
            message: 'Your question has been answered by an admin',
            recipientType: 'Specific',
            recipients: [faq.userId],
            type: 'GENERAL',
            priority: 'medium',
            metadata: {
                questionId: faq._id,
                answeredBy: req.user.id
            }
        });

        return res.status(200).json({
            success: true,
            
            faq
        });
    } catch (error) {
        console.error('Error in answerFaq:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Toggle FAQ publish status (admin only)
exports.togglePublishStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const faq = await FAQ.findById(id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        if (faq.status !== 'answered') {
            return res.status(400).json({
                success: false,
                message: 'Cannot publish unanswered FAQ'
            });
        }

        faq.isPublished = !faq.isPublished;
        await faq.save();

        return res.status(200).json({
            success: true,
            message: `FAQ ${faq.isPublished ? 'published' : 'unpublished'} successfully`,
            faq
        });
    } catch (error) {
        console.error('Error in togglePublishStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
