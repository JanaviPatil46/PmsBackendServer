const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const Account = require('../models/AccountModel.js');
const Contact = require('../models/contactsModel.js');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post('/organizersendemail', async (req, res) => {
    const { accountid, username, organizerName, organizerLink } = req.body;
    const missingContactsAccounts = [];  // Array to store account names without eligible contacts

    try {
        const account = await Account.findById(accountid);

        for (const contactId of account.contacts) {
            const contact = await Contact.findById(contactId);

            if (contact.login === true) {
                if (contact.email === '') {
                    // console.log(contact.email)
                    missingContactsAccounts.push(account.accountName);

                    if (missingContactsAccounts.length > 0) {

                        const transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false, // Use STARTTLS
                            auth: {
                                // user: "dipeeka.pote52@gmail.com",
                                // pass: "togt ljzg urar dlam",
                                user: process.env.EMAIL,
                                pass: process.env.EMAIL_PASSWORD,
                            },
                            tls: {
                                rejectUnauthorized: false // Only for development
                              },
                        });


                        const missingAccountsList = missingContactsAccounts.join(', ');
                        const proposalName = organizerName;

                        const mailOptions = {
                            // from: 'dipeeka.pote52@gmail.com',
                            // to: 'dipeeka.pote52@gmail.com',
                            from: process.env.EMAIL,
                            to: email,
                            subject: 'Unable to send Organizer to Contacts',
                            html: `
                                <p>The following accounts have no contacts who can sign proposals, so we couldn’t create proposals for them:</p>
                                <p>${missingAccountsList}</p>
                                <p>Proposal name:</p>
                                <p>${proposalName}</p>
                            `,
                        };

                        await transporter.sendMail(mailOptions);
                        res.status(200).json({ status: 200, message: "Organizer is not sent successfully." });
                        console.log('Notification email sent to user about missing contacts');
                    }
                }

                else if (contact.email != '') {
                    console.log(contact.login, contact.email)
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false, // Use STARTTLS
                        auth: {
                        //     user: "dipeeka.pote52@gmail.com",
                        //     pass: "togt ljzg urar dlam",
                        // },
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false // Only for development
                      },
                    });

                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: contact.email,
                        subject: 'New Organizer Created for You',
                        html: `
                            <p>Hello ${username},</p>
                            <p>We have created an organizer for you: ${organizerName}</p>
                            <p>Please click the link below to access it:</p>
                            <a href="${organizerLink}">View organizer</a>
                            <p>Button not working? Copy and paste this link into your browser:</p>
                            <p>${organizerLink}</p>
                        `,
                    };

                    await transporter.sendMail(mailOptions);
                    res.status(200).json({ status: 200, message: "Organizer sent successfully." });
                    console.log(`Email sent to ${contact.email}`);
                }
            }
            // else {



            // }
        }
        // }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request: ' + error.message);
    }
});

module.exports = router;
