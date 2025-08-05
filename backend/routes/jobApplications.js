const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/resumeMulter');
const {
    submitApplication,
    getApplicationById,
    deleteApplication,
    getApplicationsByEmail,
    bulkUpdateApplicationStatus,
    getApplicationStatistics,
    downloadResume
} = require('../controllers/jobApplications');

// Public routes
router.post('/submit', resumeUpload.fields([{ name: 'resume', maxCount: 1 }]), submitApplication);
router.get('/email/:email', getApplicationsByEmail);

// Admin routes
router.get('/download/:applicationId', auth, isAdmin, downloadResume);
router.get('/:applicationId', auth, isAdmin, getApplicationById);
router.delete('/:applicationId', auth, isAdmin, deleteApplication);
router.patch('/bulk-update', auth, isAdmin, bulkUpdateApplicationStatus);
router.get('/statistics/:jobId?', auth, isAdmin, getApplicationStatistics);

module.exports = router;
