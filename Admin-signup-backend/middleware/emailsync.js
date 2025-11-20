require('dotenv').config()
const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard'); // Redirect to a dashboard or appropriate page
});

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized'); // Respond with 401 instead of redirecting
  }

  const userProfile = {
    name: req.user.profile.displayName, // Example data
    email: req.user.profile.emails[0].value,

  };

  res.json(userProfile); 
  console.log(userProfile)// Return JSON data instead of redirecting
});



router.get('/logout', (req, res) => {
  try {
    req.logout((err) => { // Provide a callback function
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      res.json({ message: 'Logged out successfully' }); // Return a success message
    });
  } catch (error) {
    console.error('Error during logout:', error); // Log the error
    res.status(500).json({ error: 'Failed to log out' }); // Handle any other errors
  }
});


const { google } = require('googleapis');

router.get('/emails', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch a list of email IDs
    const response = await gmail.users.messages.list({
      userId: 'me', // Refers to the authenticated user
      labelIds: ['INBOX'], // Fetch emails from the inbox
      maxResults: 10, // Adjust the number of emails to fetch
    });

    const emailIds = response.data.messages || [];
    const emails = [];

    // Fetch the full content for each email
    for (const message of emailIds) {
      const emailDetail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full', // Get full email content
      });

      const headers = emailDetail.data.payload.headers;
      const subject = headers.find((h) => h.name === 'Subject')?.value;
      const from = headers.find((h) => h.name === 'From')?.value;

      // Extract the email body (can be in different parts)
      let body = '';
      if (emailDetail.data.payload.parts) {
        const part = emailDetail.data.payload.parts.find(
          (p) => p.mimeType === 'text/plain'
        );
        if (part?.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString(); // Decode the base64 data
        }
      }

      emails.push({
        id: message.id,
        subject,
        from,
        body, // Include the email body
      });
    }

    res.json(emails); // Return detailed email information
  } catch (error) {
    console.error('Error fetching email details:', error);
    res.status(500).send('Error fetching email details');
  }
});




router.get('/sent-emails', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized'); // Ensure the user is authenticated
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken, // Use access token to authenticate with Gmail
      refresh_token: req.user.refreshToken, // Refresh token to get new access tokens
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch the list of sent emails
    const response = await gmail.users.messages.list({
      userId: 'me', // 'me' refers to the authenticated user
      labelIds: ['SENT'], // Fetch emails from the "Sent" folder
      maxResults: 10, // Adjust the number of sent emails to fetch
    });

    const emailIds = response.data.messages || [];
    const emails = [];

    // Fetch detailed information for each sent email
    for (const message of emailIds) {
      const emailDetail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full', // Fetch full email content
      });

      const headers = emailDetail.data.payload.headers;
      const subject = headers.find((h) => h.name === 'Subject')?.value;
      const to = headers.find((h) => h.name === 'To')?.value;

      let body = '';
      if (emailDetail.data.payload.parts) {
        const part = emailDetail.data.payload.parts.find(
          (p) => p.mimeType === 'text/plain'
        );
        if (part?.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString(); // Decode base64 body
        }
      }

      emails.push({
        id: message.id,
        subject,
        to, // The recipient of the sent email
        body,
      });
    }

    res.json(emails); // Return detailed email information
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    res.status(500).send('Error fetching sent emails');
  }
});


router.post('/compose-email', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized'); // Ensure the user is authenticated
  }

  const { to, subject, body } = req.body; // Extract email components

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken, // Use access token to send emails
      refresh_token: req.user.refreshToken, // Refresh token for new access tokens
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create a raw email message
    const raw = Buffer.from(
      `To: ${to}\nSubject: ${subject}\n\n${body}` // Raw email content
    ).toString('base64'); // Encode to base64

    await gmail.users.messages.send({
      userId: 'me', // Refers to the authenticated user
      resource: {
        raw,
      },
    });

    res.json({ status: 'success', message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send email' });
  }
});






router.delete('/delete-email/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }

  const emailId = req.params.id;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    await gmail.users.messages.trash({
      userId: 'me',
      id: emailId,
    });

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).send('Error deleting email');
  }
});



module.exports = router;

