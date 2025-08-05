const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { 
    createJob,
    getAllJobs,
    getPublishedJobs,
    getJobById,
    updateJob,
    deleteJob,
    toggleJobPublication,
    getJobApplications,
    getAllApplications,
    updateApplicationStatus,
    getJobsAnalytics
} = require('../controllers/jobs');

// Public routes
router.get('/published', getPublishedJobs);
router.get('/details/:jobId', getJobById);

// Admin routes
router.post('/create', auth, isAdmin, createJob);
router.get('/all', auth, isAdmin, getAllJobs);
router.put('/update/:jobId', auth, isAdmin, updateJob);
router.delete('/delete/:jobId', auth, isAdmin, deleteJob);
router.patch('/toggle-publication/:jobId', auth, isAdmin, toggleJobPublication);
router.get('/applications/:jobId', auth, isAdmin, getJobApplications);
router.get('/applications', auth, isAdmin, getAllApplications);
router.patch('/application/:applicationId/status', auth, isAdmin, updateApplicationStatus);
router.get('/analytics', auth, isAdmin, getJobsAnalytics);

module.exports = router;
