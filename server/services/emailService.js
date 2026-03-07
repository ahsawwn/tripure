const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.spacemail.com',
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('✅ SMTP Server is ready to send emails');
    }
});

// Send email function
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Tripure Industries" <admin@rookies-demo.online>',
            to,
            subject,
            html,
            text,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

// Send reply to customer
const sendCustomerReply = async ({ to, name, subject, reply, messageId, attachments = [] }) => {
    const emailSubject = subject || `Re: Your inquiry with Tripure Industries`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                .signature { margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Tripure Industries</h2>
                    <p>Pure • Natural • Sodium Free</p>
                </div>
                <div class="content">
                    <p>Dear <strong>${name}</strong>,</p>
                    
                    <p>Thank you for contacting Tripure Industries. Here's our response to your inquiry:</p>
                    
                    <div class="message">
                        ${reply.replace(/\n/g, '<br>')}
                    </div>
                    
                    <p>If you have any further questions, please don't hesitate to reply to this email or contact us directly:</p>
                    
                    <p>
                        📞 Phone: +92 300 1234567<br>
                        📧 Email: support@tripure.com<br>
                        🌐 Web: https://tripure.rookies-demo.online
                    </p>
                    
                    <div class="signature">
                        <p>Best regards,<br>
                        <strong>The Tripure Team</strong><br>
                        Tripure Industries<br>
                        Jhelum, Pakistan</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                        <em>This is an automated response to your inquiry #${messageId}. Please keep this email for your records.</em>
                    </p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Tripure Industries. All rights reserved.</p>
                    <p>GT Road, Jhelum, Pakistan</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `Dear ${name},\n\nThank you for contacting Tripure Industries. Here's our response to your inquiry:\n\n${reply}\n\nIf you have any further questions, please don't hesitate to reply to this email.\n\nBest regards,\nThe Tripure Team\nTripure Industries\nJhelum, Pakistan`;

    return await sendEmail({
        to,
        subject: emailSubject,
        html,
        text,
        attachments
    });
};

// Send bulk email
const sendBulkEmail = async ({ recipients, subject, html, text }) => {
    const results = [];
    for (const recipient of recipients) {
        try {
            const result = await sendEmail({
                to: recipient.email,
                subject,
                html: html.replace(/{name}/g, recipient.name),
                text: text.replace(/{name}/g, recipient.name)
            });
            results.push({ ...recipient, success: true, messageId: result.messageId });
        } catch (error) {
            results.push({ ...recipient, success: false, error: error.message });
        }
    }
    return results;
};

module.exports = {
    sendEmail,
    sendCustomerReply,
    sendBulkEmail
};