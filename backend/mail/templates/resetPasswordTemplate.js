exports.resetPasswordTemplate = (email, resetLink, userName = 'User') => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Reset Your Password - Beeja Learning Platform</title>
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
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }

            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }

            .content {
                padding: 40px 30px;
            }
    
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #2c3e50;
            }
    
            .message {
                font-size: 16px;
                margin-bottom: 25px;
                color: #555;
            }

            .security-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }

            .security-notice strong {
                color: #d63031;
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
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                transition: transform 0.2s ease;
            }

            .cta:hover {
                transform: translateY(-2px);
            }

            .alternative-link {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 14px;
                color: #495057;
            }

            .expiry-info {
                background-color: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 6px 6px 0;
            }

            .expiry-info strong {
                color: #1976d2;
            }
    
            .footer {
                background-color: #f8f9fa;
                padding: 20px 30px;
                border-top: 1px solid #dee2e6;
                font-size: 14px;
                color: #6c757d;
                text-align: center;
            }

            .footer a {
                color: #667eea;
                text-decoration: none;
            }

            .social-links {
                margin-top: 15px;
            }

            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #6c757d;
                text-decoration: none;
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
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <img src="cid:beeja-logo" alt="Beeja Innovative Ventures" style="max-width: 150px; margin-bottom: 15px;">
                <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${userName},</div>
                
                <div class="message">
                    We received a request to reset the password for your Beeja Learning Platform account associated with <strong>${email}</strong>.
                </div>

                <div class="security-notice">
                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                </div>

                <div class="expiry-info">
                    <strong>⏰ Time Sensitive:</strong> This reset link will expire in <strong>15 minutes</strong> for your security.
                </div>

                <div class="cta-container">
                    <a class="cta" href="${resetLink}">Reset My Password</a>
                </div>

                <div class="message">
                    If the button above doesn't work, you can copy and paste this link into your browser:
                </div>

                <div class="alternative-link">
                    ${resetLink}
                </div>

                <div class="message">
                    <strong>What happens next?</strong>
                    <ul style="text-align: left; color: #555;">
                        <li>Click the reset link above</li>
                        <li>Create a new secure password</li>
                        <li>Log in with your new credentials</li>
                    </ul>
                </div>

                <div class="message">
                    <strong>Password Requirements:</strong>
                    <ul style="text-align: left; color: #555; font-size: 14px;">
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character (@$!%*?&)</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>This email was sent from Beeja Learning Platform. If you have any questions, please contact our support team.</p>
                <p>
                    <a href="mailto:info@beejaacademy.com">info@beejaacademy.com</a>
                </p>
                <div class="social-links">
                    <a href="#">Privacy Policy</a> | 
                    <a href="#">Terms of Service</a> | 
                    <a href="#">Help Center</a>
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">
                    © 2024 Beeja Innovative Ventures. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    
    </html>`;
};