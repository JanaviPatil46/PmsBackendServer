
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require('../models/userModel'); 
const bcrypt = require("bcryptjs")
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post("/teammemberpasswordupdate", async (req, res) => {

    const { email, password, cpassword, userid } = req.body;
console.log(req.body)
    // Step 1: Validate request data
    if (!email || !password || !cpassword || !userid) {
        return res.status(400).json({ status: 400, message: "Please provide all required fields." });
    }

    // Step 2: Ensure passwords match
    if (password !== cpassword) {
        return res.status(400).json({ status: 400, message: "Passwords do not match." });
    }

    // Step 3: Find the user by ID and email
    const user = await User.findOne({ _id: userid,email });
    if (!user) {
        return res.status(404).json({ status: 404, message: "User not found." });
    }

    // Step 5: Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 6: Update the password in the database
    user.password = hashedPassword;
    user.cpassword = hashedPassword;  // assuming you store cpassword too
    await user.save();


    const result = {
        email
    }

    const mailSubject = "Password Updated Successfully."

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

            <p>Your Account Password has been updated successfully.</p>
        
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
        subject: mailSubject,
        html: htmlPage,
    };


    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent to user:", info.response);
            res.status(200).json({ status: 200, result });
        }
    });
});

module.exports = router;
