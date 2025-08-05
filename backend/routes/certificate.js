const express = require("express");
const router = express.Router();

const {
  generateCertificate,
  verifyCertificate,
  getUserCertificates,
  regenerateCertificatesForCourse,
  getCertificateRegenerationStatus
} = require("../controllers/certificate");

const { auth, isAdmin } = require("../middleware/auth");

// ********************************************************************************************************
//                                      Certificate routes
// ********************************************************************************************************

// Generate certificate for completed course (Protected)
router.post("/generate", auth, generateCertificate);

// Verify certificate by ID (Public)
router.get("/verify/:certificateId", verifyCertificate);

// Get user's certificates (Protected)
router.get("/user-certificates", auth, getUserCertificates);

// ********************************************************************************************************
//                                      Admin Certificate routes
// ********************************************************************************************************

// Regenerate certificates for a course (Admin only)
router.post("/regenerate", auth, isAdmin, regenerateCertificatesForCourse);

// Get certificate regeneration status for a course (Admin only)
router.get("/regeneration-status/:courseId", auth, isAdmin, getCertificateRegenerationStatus);

module.exports = router;
