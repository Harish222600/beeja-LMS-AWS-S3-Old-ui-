const faqAnswerTemplate = (userName, question, answer) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Your FAQ Question Has Been Answered</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            .message {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
                margin-bottom: 20px;
                text-align: left;
            }
            .question {
                background-color: #e3f2fd;
                padding: 15px;
                border-left: 4px solid #2196f3;
                margin-bottom: 20px;
                border-radius: 4px;
            }
            .answer {
                background-color: #f1f8e9;
                padding: 15px;
                border-left: 4px solid #4caf50;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #999999;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 15px;
            }
            .highlight {
                color: #007bff;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img class="logo" src="cid:beeja-logo" alt="Beeja Innovative Ventures" style="max-width: 200px; margin-bottom: 20px;">
            <h2>Your FAQ Question Has Been Answered!</h2>
            
            <div class="message">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                
                <p>Great news! We have answered your question on our FAQ system. Here are the details:</p>
                
                <div class="question">
                    <h3>Your Question:</h3>
                    <p><strong>${question}</strong></p>
                </div>
                
                <div class="answer">
                    <h3>Our Answer:</h3>
                    <p>${answer}</p>
                </div>
                
                <p>You can view this and other frequently asked questions on our website.</p>
                
                <a href="${process.env.FRONTEND_URL || 'http://35.177.233.147:5173'}/about" class="button">
                    View All FAQs
                </a>
            </div>
            
            <div class="footer">
                <p>Thank you for using Beeja Academy!</p>
                <p>If you have any other questions, feel free to ask.</p>
                <p>Best regards,<br>The Beeja Academy Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = faqAnswerTemplate;