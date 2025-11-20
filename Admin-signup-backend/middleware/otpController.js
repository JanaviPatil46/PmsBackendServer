// controllers/otpController.js
const express = require("express");
const generateOTP = require("../middleware/randomStringGenerator");
const OTP = require("../models/otpModel"); // Import the OTP model
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.post("/request-otp", async (req, res) => {

  const email = req.body.email;
  const otp = generateOTP();

  // HTML content for the email body
  const htmlPage = `
  <!doctype html>
<html lang="en">
<style>
    p {
        color: #0f172a;
        font-size: 18px;
        line-height: 29px;
        font-weight: 400;
        margin: 8px 0 16px;
    }
    h1 {
        color: #5566e5;
        font-weight: 700;
        font-size: 40px;
        line-height: 44px;
        margin-bottom: 4px;
    }
    h2 {
        color: #1b235c;
        font-size: 100px;
        font-weight: 400;
        line-height: 120px;
        margin-top: 40px;
        margin-bottom: 40px;
    }
    .container {
        text-align: center;
    }
</style>
<body>
    <main>
        <div class="container">
            <h1> Welcome to PMS </h1>
            <p>To continue enter this confirmation code:</p>
            <h2> ${otp}</h2>
            <h5>Welcome to "SNP Tax & Financials", where tax management meets simplicity.</h5>
        </div>
    </main>
</body>
</html>`;

  // Create transporter with Gmail service and authentication using environment variables
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
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

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your account",
    html: htmlPage,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);

    // Check if an OTP record exists
    const existingOTPRecord = await OTP.findOne({ email });

    if (existingOTPRecord) {
      // Update existing OTP record
      await OTP.findOneAndUpdate({ email }, { otp }, { new: true });
      console.log("OTP updated for:", email);
      res.status(200).json({ msg: "OTP updated" });
    } else {
      // Create new OTP record
      const newOTPRecord = await OTP.create({ email, otp });
      console.log("New OTP record created:", newOTPRecord);
      res.status(200).json({ msg: "New OTP record created" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send email or update OTP record" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const email = req.body.email;
  const otpAttempt = req.body.otp;

  try {
    const otpDocument = await OTP.findOne({ email });
    if (!otpDocument) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (otpAttempt !== otpDocument.otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    await OTP.deleteOne({ email }); // Delete the OTP document after successful verification
    console.log("Email verified successfully for:", email);
    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Error verifying OTP" });
  }
});

module.exports = router;
