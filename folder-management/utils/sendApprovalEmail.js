const nodemailer = require("nodemailer");
require('dotenv').config({ override: true }); // Force override


async function sendApprovalEmail({ to, subject, html }) {
  console.log('?? Email attempt to:', to);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    // Test connection first
    await transporter.verify();
    console.log('? SMTP connection OK');

    const info = await transporter.sendMail({
      from: `"Firm Docs" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`? Email SENT to ${to} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`? Email FAILED to ${to}:`, error.message);
    console.error('Full error:', error);
    throw error;
  }
}

module.exports = sendApprovalEmail;
