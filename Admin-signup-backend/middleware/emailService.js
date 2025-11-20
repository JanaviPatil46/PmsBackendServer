const nodemailer = require("nodemailer");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // Create transporter with Outlook service and authentication
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //         user: "rohitkumbhar7009@gmail.com",
  //         pass: "vwjz zrbe rwbe dhnj",
  //     },
  // });

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
  
// Function to send email
function sendEmail(from, to, subject, text) {
  //html page 
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

module.exports = sendEmail;
