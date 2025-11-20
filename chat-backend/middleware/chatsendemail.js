const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Account = require("../models/AccountModel.js");
const Contact = require("../models/contactsModel.js");
const ChatTemplate = require("../models/ChatTempModels.js");
const User = require("../models/userModel.js");

router.post("/securechatsend", async (req, res) => {
  const { accountid, username, chattemplateid, viewchatlink, chatId } =
    req.body;
  console.log(req.body);
  const missingContactsAccounts = []; // Array to store account names without eligible contacts

  try {
    const account = await Account.findById(accountid);

    // const teamMember = await User.findById(account.teamMembers)
    console.log(account);
    console.log(chatId);
    const chatTemplate = await ChatTemplate.findById(chattemplateid);
    const chatlink = `http://localhost:3001/updatechat/${chatId}`;
    console.log(chatlink);
    for (const contactId of account.contacts) {
      const contact = await Contact.findById(contactId);

      if (contact.emailSync === true) {
        if (contact.email === "") {
        } else if (contact.email != "") {
          // console.log(contact.login, contact.email)

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL,
            to: contact.email,
            subject: `${account.accountName} sent you a secure chat`,
            html: `
                        <p>${account.accountName}</p>
                        <p><b>You have a new secure chat ${chatTemplate.templatename} from ${username} </b></p>
                        <a href="${chatlink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                        View Chat
                        </a>
                    `,
          };

          await transporter.sendMail(mailOptions);
          res
            .status(200)
            .json({ status: 200, message: "Chat sent successfully." });
          console.log(`Email sent to ${contact.email}`);
        }
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error processing request: " + error.message);
  }
});

module.exports = router;
