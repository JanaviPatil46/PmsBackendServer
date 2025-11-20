const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const TeamMember = require("../models/teamMemberModel");
const secretKey = process.env.TOKEN_KEY;
const jwt = require("jsonwebtoken")

require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post("/teammembersavedemail", async (req, res) => {

    const { email } = req.body;
    const { owneremail } = req.body;
    const url = req.body.url;
    console.log(req.body)
    const user = await User.findOne({ _id: owneremail });
    const teammember = await TeamMember.findOne({ email: email });

    if (!email) {
        res.status(400).json({ status: 400, message: "Please provide all data." })
    }

    const payload = {
        id: teammember._id,
    };

    jwt.sign(payload, secretKey, { expiresIn: "30000s" }, (err, token) => {
        const result = {
            email,
            url,
            token
        }

        const mailSubject = `${user.username} has invited you to join PMS.`

        const loginlink = `${url}${teammember._id}/${result.token}`

        console.log(loginlink)
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
            <p>${user.username} (${user.email}) has invited you to join ${user.username} on PMS. Click below to activate your account in just a few steps. 
            </p>
  
            <a href="${loginlink}" class="button" style="background-color: blue; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;" >Activate Your Account</a>


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
                // user: "rohitkumbhar7009@gmail.com",
                // pass: "vwjz zrbe rwbe dhnj",
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

        const adminEmail = process.env.ADMINEMAIL; // Replace with actual admin email
        const mailOptionsAdmin = {
            from: process.env.EMAIL,
            to: adminEmail,
            subject: "New Team Member Created",
            text: `A new Team Member  has been created with the email: ${email}`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent to Team Member:", info.response);
                // Send email to admin after successfully sending email to user
                transporter.sendMail(mailOptionsAdmin, (error, info) => {
                    if (error) {
                        console.error("Error sending email to admin:");
                    } else {
                        console.log("Email sent to admin:", info.response);
                    }
                });
                res.status(200).json({ status: 200, result });
            }
        });
    });
});

module.exports = router;
