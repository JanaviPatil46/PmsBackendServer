
const express = require("express");
const sendEmail = require("../middleware/emailService");
const router = express.Router();
const nodemailer = require("nodemailer");
const userf = require("../models/userModel")
const secretKey = process.env.TOKEN_KEY;

const jwt = require("jsonwebtoken")
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post("/forgotpassword", async (req, res) => {

  const email = req.body.email;
  const url = req.body.url;
  const user = await userf.findOne({ email: email });

  if (!email) {
    res.status(400).json({ status: 400, message: "Enter your Email." })
  }

  const payload = {
    id: user._id,
   // Add any other data you want to include in the payload
};

    jwt.sign(payload, secretKey, { expiresIn: "300s" }, (err, token) => {

  const result = {
    token
  }
  // //cookigenerate
  res.cookie('resetpasstoken', result, {
    httpOnly: true,
  });

  //res.send('JWT token is set as a cookie');
    // console.log(req.body);

  const verificationLink = `This Link Valid For 2 MINUTES ${url}/${user._id}/${result.token}`
  //console.log(verificationLink);
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
            <p>To reset your password click this link:</p>
            <link> ${verificationLink}</link>
            <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
                streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
                efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
        </div>

    </main>

</body>

</html>`;

    // Create transporter with Outlook service and authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      // auth: {
      //     user: "rohitkumbhar7009@gmail.com",
      //     pass: "vwjz zrbe rwbe dhnj",
      // },
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
    subject: "Reset Your Password.",
    html: htmlPage,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ status:200, result });

      // res.status(200).json({status:200, result });        
    }
  });
});
});
module.exports = router;
