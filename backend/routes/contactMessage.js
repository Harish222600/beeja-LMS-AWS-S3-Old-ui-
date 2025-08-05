const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const {
  submitContactForm,
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
  getContactMessageStats,
} = require("../controllers/contactMessage");

// Add route-level debugging
router.use((req, res, next) => {
  console.log('=== CONTACT MESSAGE ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Full path:', req.path);
  console.log('Params:', req.params);
  console.log('Headers:', req.headers);
  next();
});

// Public route for submitting contact form
router.post("/submit", submitContactForm);

// Admin only routes
router.get("/messages", auth, isAdmin, getAllContactMessages);

router.patch("/messages/:messageId/mark-read", (req, res, next) => {
  console.log('=== MARK AS READ ROUTE HIT ===');
  console.log('MessageId from params:', req.params.messageId);
  next();
}, auth, isAdmin, markMessageAsRead);

router.delete("/messages/:messageId", (req, res, next) => {
  console.log('=== DELETE ROUTE HIT ===');
  console.log('MessageId from params:', req.params.messageId);
  next();
}, auth, isAdmin, deleteContactMessage);

router.get("/stats", auth, isAdmin, getContactMessageStats);

module.exports = router;
