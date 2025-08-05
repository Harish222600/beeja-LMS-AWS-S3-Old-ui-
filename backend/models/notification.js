const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Legacy field for backward compatibility
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Made optional for new notification system
    },
    
    // New fields for enhanced notification system
    recipientType: {
        type: String,
        enum: ['All', 'Student', 'Instructor', 'Admin', 'Specific'],
        required: function() {
            // Required for new notifications (when recipient is not set)
            return !this.recipient;
        }
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // Array of specific user IDs for targeted delivery
    
    type: {
        type: String,
        enum: [
            // Student notifications
            'COURSE_ENROLLMENT_CONFIRMATION',
            'NEW_CONTENT_ADDED',
            'COURSE_PROGRESS_MILESTONE',
            'NEW_RATING_ON_ENROLLED_COURSE',
            
            // Instructor notifications
            'NEW_STUDENT_ENROLLMENT',
            'NEW_RATING_ON_COURSE',
            'COURSE_STATUS_CHANGE',
            'COURSE_CONTENT_UPDATE',
            'INSTRUCTOR_APPROVAL',
            
            // Admin notifications
            'NEW_COURSE_CREATION',
            'COURSE_MODIFICATION',
            'NEW_USER_REGISTRATION',
            'NEW_RATING_REVIEW',
            'ADMIN_ANNOUNCEMENT',
            
            // Chat notifications
            'NEW_STUDENT_CHAT',
            'NEW_CHAT_MESSAGE',
            
            // Legacy types (for backward compatibility)
            'COURSE_ENROLLMENT',
            'CONTENT_UPDATE',
            'PROGRESS_UPDATE',
            'REVIEW',
            'COURSE_STATUS',
            
            // General notifications
            'GENERAL',
            'SYSTEM_UPDATE'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    
    // Legacy field for backward compatibility
    read: {
        type: Boolean,
        default: false
    },
    
    // New field for default read status
    isRead: {
        type: Boolean,
        default: false
    },
    
    relatedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    relatedSubSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSection'
    },
    relatedRating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReview'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    actionUrl: {
        type: String // URL to redirect when notification is clicked
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Additional data specific to notification type
        default: {}
    },
    bulkId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient queries
// Legacy indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedCourse: 1 });

// New indexes for enhanced notification system
notificationSchema.index({ recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

// Compound index for efficient user notification queries
notificationSchema.index({ 
    recipientType: 1, 
    recipients: 1, 
    isRead: 1, 
    createdAt: -1 
});

module.exports = mongoose.model('Notification', notificationSchema);
