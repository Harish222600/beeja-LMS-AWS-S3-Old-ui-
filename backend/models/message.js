const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        // Required only if messageType is 'image'
        required: function() {
            return this.messageType === 'image';
        }
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Moderation fields
    isHidden: {
        type: Boolean,
        default: false
    },
    hiddenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hiddenReason: {
        type: String
    },
    hiddenAt: {
        type: Date
    },
    // For system messages (e.g., "Chat started", "Chat archived")
    isSystemMessage: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ isHidden: 1 });

// Pre-save middleware to handle image URLs
messageSchema.pre('save', function(next) {
    if (this.messageType === 'image' && !this.imageUrl) {
        next(new Error('Image URL is required for image messages'));
    }
    if (this.messageType === 'text' && this.imageUrl) {
        this.imageUrl = undefined;
    }
    next();
});

module.exports = mongoose.model('Message', messageSchema);
