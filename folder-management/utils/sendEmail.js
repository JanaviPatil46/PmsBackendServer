// mailer.js (or in the same file if it's simple)
const nodemailer = require("nodemailer");
require('dotenv').config({ override: true }); // Force override
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

 async function sendEmail({ to, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",       // ? use Gmail service (more reliable)
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,   // ? always send from your email
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

module.exports = sendEmail;



