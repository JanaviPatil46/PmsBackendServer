const express = require("express");
const generateOTP = require("../middleware/randomStringGenerator");
const OTP = require("../models/otpModel"); // Import the OTP model
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post("/clientrequest-otp", async (req, res) => {
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
    <header>
        <!-- place navbar here -->
    </header>
    <main>

        <div class="container ">
            <h1> Welcome to PMS </h1>
            <p>Thank you for signing up </p>
            <p> Your confirmation code is </p>

            <h2> ${otp}</h2>

            <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
                streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
                efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
        </div>

    </main>

</body>

</html>`;

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
  
  // const mailOptions = {
  //   from: "vinayak.intcon@gmail.com",
  //   to: email,
  //   subject: "Verify your account",
  //   html: htmlPage,
  // };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your account",
    html: htmlPage,
  };
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ msg: "otp generated" });
    }
  });

  try {
    // Use findOne to check if the record exists
    const existingOTPRecord = await OTP.findOne({ email: email });

    if (existingOTPRecord) {

       //todo update record

       const updatedOTPRecord = await OTP.findOneAndUpdate({ email: email }, { $set: { otp: otp } }, { new: true, upsert: true });

             // If the record exists, you can handle it accordingly
      // console.log("Existing OTP record found:", existingOTPRecord);
      // res.status(200).json({ msg: "Existing OTP record found" });
     
      //todo end
    } else {
      // If the record does not exist, create a new record
      const newOTPRecord = await OTP.create({ email: email, otp: otp });
      // console.log("New OTP record created:", newOTPRecord);
      res.status(200).json({ msg: "New OTP record created",  newOTPRecord});
    }
  } catch (error) {
    // Handle any errors that occurred during the find or insert operation
    console.error("Error finding or inserting OTP record:", error);
    res.status(500).json({ error: "Failed to find or insert OTP record" });
  }
});

router.post("/verifyclient-otp", async (req, res) => {
  const email = req.body.email;
  const otpAttempt = req.body.otp;

  try {
    const otpDocument = await OTP.findOne({ email }); // Find the OTP document by email
    if (!otpDocument) {
      console.error("Email not found:", email);
      return res.status(404).send("Email not found");
    }

    if (otpAttempt !== otpDocument.otp) {
      console.error("Invalid OTP:", otpAttempt);
      return res.status(401).send("Invalid OTP");
    }

    await OTP.deleteOne({ email }); // Delete the OTP document after successful verification

    console.log("Email verified successfully for:", email);
    res.status(200).send("Email verified successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying OTP");
  }
});

module.exports = router;