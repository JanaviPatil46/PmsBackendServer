const nodemailer = require("nodemailer");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function sendApprovalEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
   service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // Only for development
        },
    });


  await transporter.sendMail({
    from: `"Firm Docs" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendApprovalEmail;
