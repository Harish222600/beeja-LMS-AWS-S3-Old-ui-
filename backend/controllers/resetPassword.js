const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { resetPasswordTemplate } = require('../mail/templates/resetPasswordTemplate');

// Rate limiting storage (in production, use Redis)
const resetAttempts = new Map();

// Helper function to check rate limiting
const checkRateLimit = (email) => {
    const now = Date.now();
    const attempts = resetAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    // Reset counter if more than 15 minutes have passed
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
        attempts.count = 0;
    }
    
    // Allow max 3 attempts per 15 minutes
    if (attempts.count >= 3) {
        const timeLeft = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 60000);
        return { allowed: false, timeLeft };
    }
    
    return { allowed: true };
};

// Helper function to update rate limiting
const updateRateLimit = (email) => {
    const now = Date.now();
    const attempts = resetAttempts.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = now;
    resetAttempts.set(email, attempts);
};

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate password strength
const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
};

// ================ resetPasswordToken ================
exports.resetPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        // Input validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check rate limiting
        const rateCheck = checkRateLimit(email);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: `Too many password reset attempts. Please try again in ${rateCheck.timeLeft} minutes.`
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // For security, don't reveal if email exists or not
            return res.status(200).json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link shortly.'
            });
        }

        // Update rate limiting
        updateRateLimit(email);

        // Check if user already has a valid reset token
        if (user.resetPasswordTokenExpires && user.resetPasswordTokenExpires > Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'A password reset email has already been sent. Please check your email or wait before requesting another.'
            });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Update user with token
        await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { 
                token: token, 
                resetPasswordTokenExpires: tokenExpiry
            },
            { new: true }
        );

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL;
        const resetUrl = `${frontendUrl}/update-password/${token}`;

        // Send email
        try {
            const emailTemplate = resetPasswordTemplate(email, resetUrl, user.firstName || 'User');
            await mailSender(
                email, 
                'Reset Your Password - Beeja Learning Platform', 
                emailTemplate
            );

            console.log(`Password reset email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            
            // Clear the token if email fails
            await User.findOneAndUpdate(
                { email: email.toLowerCase() },
                { 
                    token: null, 
                    resetPasswordTokenExpires: null
                }
            );

            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset instructions have been sent to your email address. Please check your inbox and spam folder.'
        });

    } catch (error) {
        console.error('Error in resetPasswordToken:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
};

// ================ resetPassword ================
exports.resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        // Input validation
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordErrors
            });
        }

        // Find user by token
        const user = await User.findOne({ 
            token: token,
            resetPasswordTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user password and clear reset token
        await User.findByIdAndUpdate(
            user._id,
            { 
                password: hashedPassword,
                token: null,
                resetPasswordTokenExpires: null,
                updatedAt: new Date()
            },
            { new: true }
        );

        // Send confirmation email
        try {
            await mailSender(
                user.email,
                'Password Successfully Reset - Beeja Learning Platform',
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Password Reset Successful - Beeja Learning Platform</title>
                    <style>
                        body {
                            background-color: #f8f9fa;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 16px;
                            line-height: 1.6;
                            color: #333333;
                            margin: 0;
                            padding: 0;
                        }
                
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }

                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px 20px;
                            text-align: center;
                            position: relative;
                        }

                        .header::after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 60px;
                            height: 5px;
                            background: linear-gradient(90deg, #667eea, #764ba2);
                            border-radius: 10px;
                        }

                        .logo {
                            max-width: 180px;
                            margin-bottom: 20px;
                            border-radius: 10px;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(5px);
                        }

                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }

                        .content {
                            padding: 40px 30px;
                        }
                
                        .greeting {
                            font-size: 20px;
                            font-weight: 600;
                            margin-bottom: 25px;
                            color: #2c3e50;
                            border-bottom: 2px solid #eee;
                            padding-bottom: 15px;
                        }
                
                        .message {
                            font-size: 16px;
                            margin-bottom: 25px;
                            color: #555;
                            line-height: 1.8;
                        }

                        .success-notice {
                            background-color: #d4edda;
                            border: 1px solid #c3e6cb;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 25px 0;
                            color: #155724;
                            position: relative;
                            overflow: hidden;
                        }

                        .success-notice::before {
                            content: '✅';
                            position: absolute;
                            top: -5px;
                            right: 10px;
                            font-size: 40px;
                            opacity: 0.2;
                        }

                        .success-notice strong {
                            color: #0f5132;
                            display: block;
                            margin-bottom: 10px;
                            font-size: 18px;
                        }

                        .security-tips {
                            background: #e3f2fd;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 25px 0;
                        }

                        .security-tips h3 {
                            color: #1976d2;
                            margin-top: 0;
                            margin-bottom: 15px;
                            font-size: 18px;
                        }

                        .security-tips ul {
                            margin: 0;
                            padding-left: 20px;
                        }

                        .security-tips li {
                            margin-bottom: 10px;
                            color: #444;
                        }

                        .cta-container {
                            text-align: center;
                            margin: 30px 0;
                        }

                        .cta {
                            display: inline-block;
                            padding: 15px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            transition: transform 0.2s ease;
                        }

                        .cta:hover {
                            transform: translateY(-2px);
                        }
                
                        .footer {
                            background-color: #f8f9fa;
                            padding: 25px 30px;
                            border-top: 1px solid #dee2e6;
                            font-size: 14px;
                            color: #6c757d;
                            text-align: center;
                        }

                        .footer a {
                            color: #667eea;
                            text-decoration: none;
                            font-weight: 500;
                        }

                        .footer a:hover {
                            text-decoration: underline;
                        }

                        .copyright {
                            margin-top: 20px;
                            font-size: 12px;
                            color: #999;
                        }

                        @media (max-width: 600px) {
                            .container {
                                margin: 0;
                                border-radius: 0;
                            }
                            
                            .content {
                                padding: 30px 20px;
                            }
                            
                            .header {
                                padding: 25px 20px;
                            }

                            .logo {
                                max-width: 150px;
                            }

                            .header h1 {
                                font-size: 24px;
                            }
                        }
                    </style>
                </head>
                
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="cid:beeja-logo" alt="Beeja Innovative Ventures" class="logo">
                            <h1>🎉 Password Reset Successful</h1>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">Hello ${user.firstName || 'User'},</div>
                            
                            <div class="message">
                                Great news! Your password has been successfully reset for your Beeja Learning Platform account.
                            </div>

                            <div class="success-notice">
                                <strong>✅ Password Reset Complete</strong>
                                Your account is now secured with your new password. You can log in immediately using your new credentials.
                            </div>

                            <div class="security-tips">
                                <h3>🔐 Next Steps for Account Security</h3>
                                <ul>
                                    <li><strong>Log in now:</strong> Use your new password to access your account</li>
                                    <li><strong>Review activity:</strong> Check your recent account activity for any suspicious behavior</li>
                                    <li><strong>Update settings:</strong> Consider updating your security preferences</li>
                                    <li><strong>Enable 2FA:</strong> Add two-factor authentication for extra security</li>
                                    <li><strong>Stay vigilant:</strong> Monitor your account regularly for unauthorized access</li>
                                </ul>
                            </div>

                            <div class="cta-container">
                                <a href="${process.env.FRONTEND_URL || 'http://35.177.233.147:5173'}/login" class="cta">
                                    Log In to Your Account
                                </a>
                            </div>

                            <div class="message">
                                <strong>⚠️ Important:</strong> If you did not request this password reset, please contact our support team immediately at 
                                <a href="mailto:info@beejaacademy.com" style="color: #667eea;">info@beejaacademy.com</a>
                            </div>
                        </div>

                        <div class="footer">
                            <p>This is an automated message from Beeja Learning Platform.</p>
                            <p>If you have any questions or concerns, please contact our support team at:<br>
                                <a href="mailto:info@beejaacademy.com">info@beejaacademy.com</a>
                            </p>
                            <div class="copyright">
                                © 2024 Beeja Innovative Ventures. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `
            );
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if confirmation email fails
        }

        console.log(`Password successfully reset for user: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while resetting your password. Please try again.'
        });
    }
};

// ================ verifyResetToken ================
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Find user with valid token
        const user = await User.findOne({ 
            token: token,
            resetPasswordTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reset token is valid',
            data: {
                email: user.email,
                expiresAt: user.resetPasswordTokenExpires
            }
        });

    } catch (error) {
        console.error('Error in verifyResetToken:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the reset token'
        });
    }
};
