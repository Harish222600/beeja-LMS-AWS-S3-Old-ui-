const mongoose = require('mongoose');

const recycleBinSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ['User', 'Course', 'Category'],
        required: true
    },
    originalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    originalData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        default: ''
    },
    // Auto-expire after 30 days
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
    }
}, { 
    timestamps: true 
});

// Index for efficient queries
recycleBinSchema.index({ itemType: 1, deletedAt: -1 });
recycleBinSchema.index({ deletedBy: 1 });
recycleBinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RecycleBin', recycleBinSchema);
