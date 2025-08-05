const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    // Admin moderation fields
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagReason: {
        type: String
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    // Unread message counts
    unreadByStudent: {
        type: Number,
        default: 0
    },
    unreadByInstructor: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
chatSchema.index({ student: 1, course: 1 });
chatSchema.index({ instructor: 1, isActive: 1 });
chatSchema.index({ course: 1, isActive: 1 });
chatSchema.index({ lastMessageTime: -1 });
chatSchema.index({ isArchived: 1, isActive: 1 });

// Ensure unique chat per student-course combination
chatSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
