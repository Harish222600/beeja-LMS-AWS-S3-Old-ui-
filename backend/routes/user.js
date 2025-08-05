const express = require('express');
const router = express.Router();

// Controllers
const {
    signup,
    login,
    sendOTP,
    changePassword
} = require('../controllers/auth');

// Resetpassword controllers
const {
    resetPasswordToken,
    resetPassword,
    verifyResetToken,
} = require('../controllers/resetPassword');

// Coupon controllers
const {
    validateAndApplyCoupon,
    getFrontendCoupons
} = require('../controllers/coupon');

// Middleware
const { auth } = require('../middleware/auth');
const { couponValidationLimiter } = require('../middleware/rateLimiter');


// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route for sending OTP to the user's email
router.post('/sendotp', sendOTP);

// Route for Changing the password
router.post('/changepassword', auth, changePassword);

// Route for verifying token (used by auth checker)
router.get('/verify-token', auth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// ********************************************************************************************************
//                                      Coupon Routes (User accessible)
// ********************************************************************************************************

// Route for validating and applying coupons (requires authentication)
router.post('/coupons/validate-and-apply', auth, couponValidationLimiter, validateAndApplyCoupon);

// Route for getting frontend coupons (public endpoint)
router.get('/coupons/frontend', getFrontendCoupons);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post('/reset-password-token', resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Route for verifying reset token
router.get("/verify-reset-token/:token", verifyResetToken)


module.exports = router
