const nodeMailer = require('nodemailer');

// Function to send an email using Nodemailer
const sendEmail = async (options) => {
    // Create a transporter using the specified email service and authentication
    const transporter = nodeMailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASS
        }
    });

    // Define the email options including sender, recipient, subject, and message
    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // Send the email using the transporter and specified options
    await transporter.sendMail(mailOptions);
};

// Export the sendEmail function to be used elsewhere
module.exports = sendEmail;
