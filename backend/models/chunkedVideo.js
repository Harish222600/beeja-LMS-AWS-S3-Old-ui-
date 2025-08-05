const mongoose = require('mongoose');

const chunkedVideoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    originalFilename: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true
    },
    uploadId: {
        type: String,
        required: true // S3 multipart upload ID
    },
    totalSize: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        default: 'videos'
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    finalVideoUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    // Metadata for video playback
    duration: {
        type: Number,
        default: 0
    }
});

// Index for efficient queries
chunkedVideoSchema.index({ videoId: 1 });
chunkedVideoSchema.index({ isComplete: 1 });
chunkedVideoSchema.index({ createdAt: 1 });
chunkedVideoSchema.index({ uploadId: 1 });

// Static method to cleanup old incomplete uploads (older than 24 hours)
chunkedVideoSchema.statics.cleanupOldUploads = async function() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
        const oldUploads = await this.find({
            isComplete: false,
            createdAt: { $lt: twentyFourHoursAgo }
        });

        if (oldUploads.length > 0) {
            // Use the cleanup function from S3 chunked uploader
            const { cleanupIncompleteUploads } = require('../utils/s3ChunkedVideoUploader');
            await cleanupIncompleteUploads();
        }

        console.log(`Found ${oldUploads.length} old incomplete uploads for cleanup`);
        return oldUploads.length;
    } catch (error) {
        console.error('Error cleaning up old uploads:', error);
        return 0;
    }
};

module.exports = mongoose.model('ChunkedVideo', chunkedVideoSchema);
