
// const express = require("express");
// const router = express.Router();
// const nodemailer = require("nodemailer");
// require('dotenv').config();
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// router.post("/clientsavedemail", async (req, res) => {

//     const { email } = req.body;
//     const url = req.body.url

//     if (!email) {
//         res.status(400).json({ status: 400, message: "Please provide all data." })
//     }

//     const result = {
//         email
//       }

//    const mailSubject =  "Client created Successfully."

//     const loginlink = `${url}`
//     // HTML content for the email body
//     const htmlPage = `
//   <!doctype html>
// <html lang="en">
// <style>
//     p {
//         color: #0f172a;
//         font-size: 18px;
//         line-height: 29px;
//         font-weight: 400;
//         margin: 8px 0 16px;
//     }

//     h1 {
//         color: #5566e5;
//         font-weight: 700;
//         font-size: 40px;
//         line-height: 44px;
//         margin-bottom: 4px;
//     }

//     h2 {
//         color: #1b235c;
//         font-size: 100px;
//         font-weight: 400;
//         line-height: 120px;
//         margin-top: 40px;
//         margin-bottom: 40px;
//     }

//     .container {
//         text-align: center;
//     }
// </style>

// <body>
//     <header>
//         <!-- place navbar here -->
//     </header>
//     <main>

//         <div class="container ">
//             <h1> Welcome to PMS </h1>
//             <p>Your Client Account has been created successfully.</p>
//             <p>Please click <link> ${loginlink}</link> to Login your account.</p> <!-- Include mailBody here -->
//             <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
//                 streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
//                 efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
//         </div>

//     </main>

// </body>

// </html>`;

//     // Create transporter with Outlook service and authentication
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.EMAIL,
//             pass: process.env.EMAIL_PASSWORD,
//         },
//         tls: {
//             rejectUnauthorized: false // Only for development
//           },
//     });

//     const mailOptions = {
//         from: process.env.EMAIL,
//         to: email,
//         subject: mailSubject,
//         html: htmlPage,
//     };

//     const adminEmail = process.env.ADMINEMAIL; // Replace with actual admin email
//     const mailOptionsAdmin = {
//         from: process.env.EMAIL,
//         to: adminEmail,
//         subject: "New Client Created",
//         text: `A new client has been created with the email: ${email}`,
//     };

//     // Send the email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error("Error sending email:", error);
//         } else {
//             console.log("Email sent to client:", info.response);
//             // Send email to admin after successfully sending email to user
//             transporter.sendMail(mailOptionsAdmin, (error, info) => {
//                 if (error) {
//                     console.error("Error sending email to admin:", error);
//                 } else {
//                     console.log("Email sent to admin:", info.response);
//                 }
//             });
//             res.status(200).json({ status: 200, result });
//         }
//     });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require('dotenv').config();
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const secretKey = process.env.TOKEN_KEY;
const jwt = require("jsonwebtoken")
router.post("/clientsavedemail", async (req, res) => {

    const { email, personalMessage,AccountId } = req.body;
    const url = req.body.url

    if (!email) {
        res.status(400).json({ status: 400, message: "Please provide all data." })
    }
 const payload = {
        id: AccountId,
    };

    jwt.sign(payload, secretKey, { expiresIn: "30000s" }, (err, token) => {
        const result = {
            email,
            url,
            token
        }
    

    const mailSubject = "Client created Successfully."

    // const loginlink = `${url}`
      const loginlink = `${url}/${AccountId}/${result.token}`
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
.login-btn {
    display: inline-block;
    padding: 10px 18px;
    background-color: #1a73e8; /* SNP Tax theme blue */
    color: #fff !important;
    font-weight: bold;
    text-decoration: none;
    border-radius: 6px;
    transition: 0.3s;
  }
.login-btn:hover {
    background-color: #0c57b5;
  }
</style>

<body>
    <header>
        <!-- place navbar here -->
    </header>
    <main>

        <div class="container ">
            <h1> Welcome to PMS </h1>
            <p>${personalMessage}</p>
            <p>Your Client Account has been created successfully.</p>
        
      <a href="${loginlink}" 
       style="display: inline-block; 
              padding: 12px 20px; 
              background-color: #1a73e8; 
              color: #ffffff; 
              font-size: 16px; 
              font-weight: bold; 
              text-decoration: none; 
              border-radius: 6px;">
      Activate Account
    </a>
                  <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
                streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
                efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
        </div>

    </main>

</body>

</html>`;

    // Create transporter with Outlook service and authentication
    //     const transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: "dipeeka.pote52@gmail.com",
    //         pass: "togt ljzg urar dlam",
    //     },
    //     tls: {
    //         rejectUnauthorized: false, // For development only
    //     },
    //     port: 587, // Use port 587 for STARTTLS
    //     host: 'smtp.gmail.com', // Gmail SMTP server
    // });
    console.log(process.env.ADMINEMAIL)

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
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
        subject: "New Client Created",
        text: `A new client has been created with the email: ${email}`,
    };

    // Send the email
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.error("Error sending email:", error);
    //     } else {
    //         console.log("Email sent to client:", info.response);
    //         // Send email to admin after successfully sending email to user
    //         transporter.sendMail(mailOptionsAdmin, (error, info) => {
    //             if (error) {
    //                 console.error("Error sending email to admin:", error);
    //             } else {
    //                 console.log("Email sent to admin:", info.response);
    //             }
    //         });
    //         res.status(200).json({ status: 200, result });
    //     }
    // });

    console.log(process.env.ADMINEMAIL)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ status: 500, message: "Failed to send email." });
        } else {
            console.log("Email sent to client:", info.response);
            // Send email to admin after successfully sending email to client
            transporter.sendMail(mailOptionsAdmin, (error, info) => {
                if (error) {
                    console.error("Error sending email to admin:", error);
                } else {
                    console.log("Email sent to admin:", info.response);
                }
            });
            res.status(200).json({ status: 200, result });
        }
    });

});
});


router.post("/newclientsavedemail", async (req, res) => {

    const { email, personalMessage,AccountId } = req.body;
    const url = req.body.url

    if (!email) {
        res.status(400).json({ status: 400, message: "Please provide all data." })
    }
 const payload = {
        id: AccountId,
    };

    jwt.sign(payload, secretKey, { expiresIn: "30000s" }, (err, token) => {
        const result = {
            email,
            url,
            token
        }
    

    const mailSubject = "Client created Successfully."

    const loginlink = `${url}`
    //   const loginlink = `${url}/${AccountId}/${result.token}`
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
            <p>${personalMessage}</p>
            <p>Your Client Account has been created successfully.</p>
            <p>Please click <link> ${loginlink}</link> to Login your account.</p> <!-- Include mailBody here -->
            <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
                streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
                efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
        </div>

    </main>

</body>

</html>`;

    // Create transporter with Outlook service and authentication
    //     const transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: "dipeeka.pote52@gmail.com",
    //         pass: "togt ljzg urar dlam",
    //     },
    //     tls: {
    //         rejectUnauthorized: false, // For development only
    //     },
    //     port: 587, // Use port 587 for STARTTLS
    //     host: 'smtp.gmail.com', // Gmail SMTP server
    // });
    console.log(process.env.ADMINEMAIL)

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
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
        subject: "New Client Created",
        text: `A new client has been created with the email: ${email}`,
    };

    // Send the email
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.error("Error sending email:", error);
    //     } else {
    //         console.log("Email sent to client:", info.response);
    //         // Send email to admin after successfully sending email to user
    //         transporter.sendMail(mailOptionsAdmin, (error, info) => {
    //             if (error) {
    //                 console.error("Error sending email to admin:", error);
    //             } else {
    //                 console.log("Email sent to admin:", info.response);
    //             }
    //         });
    //         res.status(200).json({ status: 200, result });
    //     }
    // });

    console.log(process.env.ADMINEMAIL)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ status: 500, message: "Failed to send email." });
        } else {
            console.log("Email sent to client:", info.response);
            // Send email to admin after successfully sending email to client
            transporter.sendMail(mailOptionsAdmin, (error, info) => {
                if (error) {
                    console.error("Error sending email to admin:", error);
                } else {
                    console.log("Email sent to admin:", info.response);
                }
            });
            res.status(200).json({ status: 200, result });
        }
    });

});
});

module.exports = router;