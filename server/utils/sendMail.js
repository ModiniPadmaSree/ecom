    // backend/utils/sendEmail.js
    const nodemailer = require('nodemailer');

    const sendEmail = async (options) => {
        // Create a transporter using Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // Use true for port 465 (SSL), false for other ports (like 587 with TLS)
            auth: {
                user: process.env.SMTP_MAIL,     // Your email address (from .env)
                pass: process.env.SMTP_PASSWORD, // Your email app password (from .env)
            },
        });

        // Define mail options
        const mailOptions = {
            from: process.env.SMTP_MAIL, // Sender email address
            to: options.email,          // Recipient email address
            subject: options.subject,   // Email subject
            html: options.message,      // Email body (HTML format recommended for richer content)
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    };

    module.exports = sendEmail; // Export the sendEmail function
    