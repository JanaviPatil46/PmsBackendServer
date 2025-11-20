const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const Account = require('../models/AccountModel.js');
const Contact = require('../models/contactsModel.js');
const ChatTemplate = require('../models/ChatTempModels.js')
const User = require('../models/userModel.js')
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.post('/securemessagechatsend', async (req, res) => {

    const { accountid, username, chattemplateid, viewchatlink,chatId } = req.body;
    console.log(req.body)
    const missingContactsAccounts = [];  // Array to store account names without eligible contacts

    try {
        const account = await Account.findById(accountid);

        // const teamMember = await User.findById(account.teamMembers)

        const chatTemplate = await ChatTemplate.findById(chattemplateid);

       const chatlink = `http://localhost:3000/updatechat/${chatId}`
        for (const contactId of account.contacts) {
            const contact = await Contact.findById(contactId);
            
            if (contact.emailSync === true) {
               
                if (contact.email === '') {
                    // console.log(contact.email)
                    // missingContactsAccounts.push(account.accountName);

                    // if (missingContactsAccounts.length > 0) {

                    //     const transporter = nodemailer.createTransport({
                    //         host: "smtp.gmail.com",
                    //         port: 587,
                    //         secure: false, // Use STARTTLS
                    //         auth: {
                    //             user: "dipeeka.pote52@gmail.com",
                    //             pass: "togt ljzg urar dlam",
                    //         },
                    //     });

                    //     const missingAccountsList = missingContactsAccounts.join(', ');
                    //     const chatTemplateName = chatTemplate.templatename;

                    //     const mailOptions = {
                    //         from: 'dipeeka.pote52@gmail.com',
                    //         to: 'dipeeka.pote52@gmail.com',
                    //         subject: 'Some proposals were not created',
                    //         html: `
                    //             <p>The following accounts have no contacts who can sign proposals, so we couldn’t create proposals for them:</p>
                    //             <p>${missingAccountsList}</p>
                    //             <p>Proposal name:</p>
                    //             <p>${chatTemplateName}</p>
                    //         `,
                    //     };


                    //     await transporter.sendMail(mailOptions);
                    //     res.status(200).json({ status: 200, message: "Proposal sent successfully." });
                    //     console.log('Notification email sent to user about missing contacts');

                    // }
                }
             
                else if (contact.email != '') {
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
                            rejectUnauthorized: false
                        },
                    });

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: contact.email,
                        subject: `${account.accountName} sent you a secure chat`,
                        html: `
                        <p>${username}</p>
                        <p><b> ${username} sent a message to your secure chat  ${chatTemplate.templatename} </b></p>
                        <a href="${chatlink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                        View Chat
                        </a>
                    `,
                    };

                    await transporter.sendMail(mailOptions);
                    res.status(200).json({ status: 200, message: "Chat sent successfully." });
                    console.log(`Email sent to ${contact.email}`);
                }
            }
        }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request: ' + error.message);
    }
});

module.exports = router;
 