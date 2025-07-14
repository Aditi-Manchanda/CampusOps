const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({ from: `"BITS Event Manager" <${process.env.EMAIL_USER}>`, to, subject, html });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

const sendRsvpConfirmation = (userEmail, event) => sendEmail(userEmail, `Confirmation for ${event.title}`, `<h1>You're Registered!</h1><p>You have successfully registered for <strong>${event.title}</strong>.</p><p>It will take place at <strong>${event.venueName}</strong> on <strong>${event.startTime.toDate().toLocaleString()}</strong>.</p><p>Your QR code is available in the "My RSVPs" section of the app.</p>`);
const sendEventDecision = (creatorEmail, event, decision) => sendEmail(creatorEmail, `Your Event "${event.title}" has been ${decision}`, `<h1>Event Status Update</h1><p>Your event submission, <strong>${event.title}</strong>, has been <strong>${decision}</strong>.</p>${decision === 'rejected' ? `<p>Reason: ${event.rejectionReason}</p>` : ''}`);
const sendEventReminder = (userEmail, event) => sendEmail(userEmail, `Reminder: ${event.title} is tomorrow!`, `<h1>Event Reminder</h1><p>This is a reminder that you are registered for <strong>${event.title}</strong>, which is happening tomorrow!</p><p><strong>Venue:</strong> ${event.venueName}</p><p><strong>Time:</strong> ${event.startTime.toDate().toLocaleString()}</p>`);

module.exports = { sendRsvpConfirmation, sendEventDecision, sendEventReminder };

