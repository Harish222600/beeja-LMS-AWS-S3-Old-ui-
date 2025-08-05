const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadVideoInChunks, cleanupIncompleteUploads } = require('../utils/s3ChunkedVideoUploader');
const ChunkedVideo = require('../models/chunkedVideo');

// Middleware to parse JSON and handle file uploads
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload large video using S3 multipart upload
 * POST /api/chunked-upload/upload
 */
router.post('/upload', auth, upload.single('video'), async (req, res) => {
    try {
        console.log('=== S3 MULTIPART UPLOAD REQUEST START ===');
        console.log('Request method:', req.method);
        console.log('Request URL:', req.url);
        console.log('User from auth:', req.user);
        console.log('File present:', !!req.file);
        
        if (!req.file) {
            console.log('❌ No video file provided');
            return res.status(400).json({
                success: false,
                message: 'No video file provided',
                error: 'MISSING_VIDEO_FILE'
            });
        }

        const { folder = 'videos' } = req.body;
        
        console.log('📤 Starting S3 multipart upload:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            folder
        });
        
        const result = await uploadVideoInChunks(req.file, folder);
        
        console.log('✅ S3 multipart upload completed successfully:', result);
        res.status(200).json({
            success: true,
            data: result,
            message: 'Video uploaded successfully'
        });
    } catch (error) {
        console.error('❌ Error in S3 multipart upload:', error);
        console.error('Error stack:', error.stack);
        
        // Ensure we always return JSON, never HTML
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload video',
                error: 'UPLOAD_FAILED',
                details: {
                    errorType: error.name,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
});

/**
 * Get all chunked uploads for a user (for debugging/admin)
 * GET /api/chunked-upload/list
 */
router.get('/list', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = {};
        if (status === 'complete') {
            query.isComplete = true;
        } else if (status === 'incomplete') {
            query.isComplete = false;
        }

        const chunkedVideos = await ChunkedVideo.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('videoId originalFilename totalSize isComplete createdAt completedAt finalVideoUrl s3Key uploadId');

        const total = await ChunkedVideo.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                uploads: chunkedVideos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            message: 'Chunked uploads retrieved successfully'
        });
    } catch (error) {
        console.error('Error listing chunked uploads:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to list chunked uploads'
        });
    }
});

/**
 * Cancel/Delete an incomplete chunked upload
 * DELETE /api/chunked-upload/:videoId
 */
router.delete('/:videoId', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const chunkedVideo = await ChunkedVideo.findOne({ videoId });
        if (!chunkedVideo) {
            return res.status(404).json({
                success: false,
                message: 'Chunked upload not found'
            });
        }

        if (chunkedVideo.isComplete) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete completed upload'
            });
        }

        // Use the pre-remove hook to clean up S3 multipart upload
        await chunkedVideo.remove();

        res.status(200).json({
            success: true,
            message: 'Chunked upload cancelled and cleaned up successfully'
        });
    } catch (error) {
        console.error('Error cancelling chunked upload:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to cancel chunked upload'
        });
    }
});

/**
 * Cleanup old incomplete uploads
 * POST /api/chunked-upload/cleanup
 */
router.post('/cleanup', auth, async (req, res) => {
    try {
        console.log('🧹 Starting cleanup of old incomplete uploads...');
        
        await cleanupIncompleteUploads();
        
        res.status(200).json({
            success: true,
            message: 'Cleanup completed successfully'
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to cleanup uploads'
        });
    }
});

module.exports = router;
