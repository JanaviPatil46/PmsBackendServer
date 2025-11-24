const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/editnotifyloginemailsync', async (req, res) => {

    const { useremail, operations, accountsSummary, timestamp } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: "dipeeka.pote52@gmail.com",
                pass: "togt ljzg urar dlam",
            },
        });

     
        // const mailOptions = {
        //     from: 'dipeeka.pote52@gmail.com',
        //     to: 'dipeeka.pote52@gmail.com',
        //     subject: 'Some proposals were not created',
        //     html: `
        //         <p>The following accounts have no contacts who can sign proposals, so we couldn’t create proposals for them:</p>
        //         <p>${missingAccountsList}</p>
        //         <p>Proposal name:</p>
        //         <p>${proposalName}</p>
        //     `,
        // };

        const mailOptions = {
            from: 'dipeeka.pote52@gmail.com',
            to: useremail,
            subject: 'Bulk Edit Operation Summary',
            html: `
                                <p><b>Bulk edit of login, notify, and email sync settings is complete</b></p>
                                <p>${timestamp}</p>
                                <p><b>Operations:</b></p>
                                <ul>
                                    <li>Login: ${operations.login}</li>
                                    <li>Notify: ${operations.notify}</li>
                                    <li>Email sync: ${operations.emailSync}</li>
                                </ul>
                                <p><b>Accounts:</b></p>
                                <ul>
                                    <li>Total: ${accountsSummary.total}</li>
                                    <li>Successful: ${accountsSummary.successful}</li>
                                    <li>Failed: ${accountsSummary.failed}</li>
                                </ul>
                            `,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ status: 200, message: "Proposal sent successfully." });
        console.log('Notification email sent to user about missing contacts');

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request: ' + error.message);
    }
});

module.exports = router;
