// mailer.js (or in the same file if it's simple)
 const nodemailer = require("nodemailer");
// require("dotenv").config();
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

module.exports = transporter;
