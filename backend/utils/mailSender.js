const nodemailer = require('nodemailer');
const path = require('path');

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error('Mail configuration is missing. Please check environment variables.');
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            tls: {
                rejectUnauthorized: false, // Accept all certificates
                minVersion: 'TLSv1'  // Allow older TLS versions
            }
        });

        const info = await transporter.sendMail({
            from: 'Beeja Academy || Innovative Learning',
            to: email,
            subject: title,
            html: body,
            attachments: [
                {
                    filename: 'beeja-logo.png',
                    path: path.join(__dirname, '../public/images/Beeja innovative ventures.png'),
                    cid: 'beeja-logo'
                }
            ]
        });

        console.log('Email sent successfully to:', email);
        return info;
    }
    catch (error) {
        console.error('Error while sending mail:', {
            email,
            error: error.message,
            stack: error.stack
        });
        throw error; // Propagate error to handle it in the calling function
    }
}

module.exports = mailSender;