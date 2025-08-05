const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  generateSignedUrl,
  handleUploadComplete,
  getUploadStatus,
  deleteUpload
} = require('../controllers/upload');

/**
 * Generate signed URL for direct upload to Supabase Storage
 * POST /api/v1/upload/signed-url
 */
router.post('/signed-url', auth, generateSignedUrl);

/**
 * Handle upload completion and metadata processing
 * POST /api/v1/upload/complete
 */
router.post('/complete', auth, handleUploadComplete);

/**
 * Get upload status and metadata
 * GET /api/v1/upload/status/:uploadId
 */
router.get('/status/:uploadId', auth, getUploadStatus);

/**
 * Delete uploaded file
 * DELETE /api/v1/upload/:uploadId
 */
router.delete('/:uploadId', auth, deleteUpload);

module.exports = router;
