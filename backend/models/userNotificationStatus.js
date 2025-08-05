const mongoose = require('mongoose');

const userNotificationStatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
userNotificationStatusSchema.index({ user: 1, notification: 1 }, { unique: true });
// Index for fetching user's notifications
userNotificationStatusSchema.index({ user: 1, deleted: 1, createdAt: -1 });

module.exports = mongoose.model('UserNotificationStatus', userNotificationStatusSchema);
