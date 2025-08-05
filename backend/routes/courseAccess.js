const express = require('express');
const router = express.Router();

const {
    requestCourseAccess,
    getUserAccessRequests,
    getAllAccessRequests,
    handleAccessRequest,
    getFreeCourses,
    requestBundleAccess,
    getBundleRequests,
    updateBundleRequestStatus
} = require('../controllers/courseAccess');

const { auth, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/free-courses', getFreeCourses);

// Student routes
router.post('/request-access', auth, requestCourseAccess);
router.get('/my-requests', auth, getUserAccessRequests);

// Admin routes
router.get('/requests', auth, isAdmin, getAllAccessRequests);
router.put('/requests/:requestId', auth, isAdmin, handleAccessRequest);

// Bundle access routes
router.post('/bundle-request', auth, requestBundleAccess);
router.get('/bundle-requests', auth, isAdmin, getBundleRequests);
router.post('/bundle-update-status/:bundleId', auth, isAdmin, updateBundleRequestStatus);

module.exports = router;
