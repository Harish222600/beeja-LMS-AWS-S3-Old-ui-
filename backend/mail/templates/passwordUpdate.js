exports.passwordUpdated = (email, name = 'User') => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Updated Successfully - Beeja Learning Platform</title>
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

            .security-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                color: #856404;
                position: relative;
                overflow: hidden;
            }

            .security-notice::before {
                content: '⚠️';
                position: absolute;
                top: -5px;
                right: 10px;
                font-size: 40px;
                opacity: 0.2;
            }

            .security-notice strong {
                color: #d63031;
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
                <h1>🔐 Password Successfully Updated</h1>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${name},</div>
                
                <div class="message">
                    Your password for the Beeja Learning Platform account associated with <strong>${email}</strong> has been successfully updated.
                </div>

                <div class="security-notice">
                    <strong>⚠️ Security Notice</strong>
                    If you did not make this change, please contact our support team immediately as your account may have been compromised.
                </div>

                <div class="security-tips">
                    <h3>🛡️ Security Tips</h3>
                    <ul>
                        <li><strong>Keep it Secret:</strong> Never share your password with anyone, including Beeja support staff.</li>
                        <li><strong>Stay Unique:</strong> Use different passwords for different accounts to enhance security.</li>
                        <li><strong>Enable 2FA:</strong> Consider enabling two-factor authentication for an extra layer of security.</li>
                        <li><strong>Monitor Activity:</strong> Regularly check your account activity for any suspicious behavior.</li>
                        <li><strong>Stay Updated:</strong> Keep your devices and browsers up to date with the latest security patches.</li>
                    </ul>
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
    
    </html>`;
};
