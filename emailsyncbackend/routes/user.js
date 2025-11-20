// // const express = require('express');
// // const { google } = require('googleapis');
// // const AuthUser = require('../models/User'); // adjust path if needed
// // require('dotenv').config();

// // const router = express.Router();

// // const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// // const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// // const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// // router.get('/login-with-token/:email', async (req, res) => {
// //   try {
// //     const user = await AuthUser.findOne({ email: req.params.email });

// //     if (!user || !user.refresh_token) {
// //       return res.status(401).json({ message: 'Refresh token not found. Please login again.' });
// //     }

// //     const oauth2Client = new google.auth.OAuth2(
// //       CLIENT_ID,
// //       CLIENT_SECRET,
// //       REDIRECT_URI
// //     );

// //     oauth2Client.setCredentials({
// //       refresh_token: user.refresh_token,
// //     });

// //     const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// //     const profile = await gmail.users.getProfile({ userId: 'me' });

// //     return res.status(200).json({ profile: profile.data });
// //   } catch (error) {
// //     console.error('Token login failed:', error.message);
// //     return res.status(500).json({ message: 'Failed to auto-login', error: error.message });
// //   }
// // });

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const User = require('../models/User');
// require('dotenv').config();

// router.get('/login-with-token/:email', async (req, res) => {
//   try {
//     const email = req.params.email;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const oAuth2Client = new google.auth.OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       process.env.REDIRECT_URI
//     );

//     oAuth2Client.setCredentials({
//       refresh_token: user.refresh_token,
      
//     });
// console.log("oAuth2Client", oAuth2Client)
//     // This automatically refreshes access_token if expired
//     const tokenResponse = await oAuth2Client.getAccessToken();

//     // Save new access_token and expiry
//     user.access_token = tokenResponse.token;
//     user.expiry_date = Date.now() + 3600 * 1000; // 1 hour from now
//     await user.save();

//     // Use new token to access Gmail
//     oAuth2Client.setCredentials({
//       access_token: tokenResponse.token,
//     });

//     const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
//     const profile = await gmail.users.getProfile({ userId: 'me' });

//     res.status(200).json({
//       message: 'Logged in using stored token',
//       profile: profile.data
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error during token login', error: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const User = require('../models/User');

// router.get('/login-with-token/:email', async (req, res) => {
//   try {
//     const email = req.params.email;
//     const user = await User.findOne({ email });

//     if (!user || !user.refresh_token) {
//       return res.status(404).json({ message: 'User or refresh token not found' });
//     }

//     const oAuth2Client = new google.auth.OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       process.env.REDIRECT_URI
//     );

//     // Set only refresh token
//     oAuth2Client.setCredentials({
//       refresh_token: user.refresh_token,
//     });

//     // ✅ Get new access token automatically
//     const { token } = await oAuth2Client.getAccessToken();

//     // Update DB
//     user.access_token = token;
//     user.expiry_date = Date.now() + 3600 * 1000;
//     await user.save();

//     // Use the new access token
//     oAuth2Client.setCredentials({
//       access_token: token
//     });

//     const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
//     const profile = await gmail.users.getProfile({ userId: 'me' });

//     return res.status(200).json({
//       message: 'Auto login success',
//       profile: profile.data
//     });

//   } catch (error) {
//     console.error('Auto login error:', error.message);
//     return res.status(500).json({ message: 'Auto login failed', error: error.message });
//   }
// });



// login with refreshtoken successfully
// router.get('/login-with-token/:email', async (req, res) => {
//   const user = await User.findOne({ email: req.params.email });
//   if (!user) return res.status(404).json({ message: 'User not found' });

//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
//   );

//   oAuth2Client.setCredentials({ refresh_token: user.refresh_token });

//   const { token } = await oAuth2Client.getAccessToken();

//   user.access_token = token;
//   user.expiry_date = Date.now() + 3600 * 1000;
//   await user.save();

//   oAuth2Client.setCredentials({ access_token: token });

//   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
//   const profile = await gmail.users.getProfile({ userId: 'me' });

//   return res.json({ profile: profile.data });
// });


// login with refreshtoken and fetch email list
// router.get('/login-with-token/:email', async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.params.email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const oAuth2Client = new google.auth.OAuth2(
//       process.env.CLIENT_ID,
//       process.env.CLIENT_SECRET,
//       process.env.REDIRECT_URI
//     );

//     oAuth2Client.setCredentials({ refresh_token: user.refresh_token });

//     const { token } = await oAuth2Client.getAccessToken();

//     user.access_token = token;
//     user.expiry_date = Date.now() + 3600 * 1000;
//     await user.save();

//     oAuth2Client.setCredentials({ access_token: token });

//     const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

//     //  Get profile
//     const profile = await gmail.users.getProfile({ userId: 'me' });

//     //  Get list of messages from inbox
//     const messageListResponse = await gmail.users.messages.list({
//       userId: 'me',
//       labelIds: ['INBOX'],
//       maxResults: 100, // adjust as needed
//     });

//     const messages = messageListResponse.data.messages || [];

//     //  Fetch subject/snippet for each message
//     const messageDetails = await Promise.all(
//       messages.map(async (msg) => {
//         const fullMsg = await gmail.users.messages.get({
//           userId: 'me',
//           id: msg.id,
//           // format: 'metadata',
//           format: 'full',
//           metadataHeaders: ['Subject', 'From'],
//         });

//         const headers = fullMsg.data.payload.headers;
//         const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
//         const from = headers.find(h => h.name === 'From')?.value || '(No Sender)';

//          //  Extract body
//     let body = '';

//     const getBodyFromPayload = (payload) => {
//       if (payload.parts) {
//         for (const part of payload.parts) {
//           if (part.mimeType === 'text/plain' && part.body?.data) {
//             return Buffer.from(part.body.data, 'base64').toString('utf-8');
//           }
//         }
//       } else if (payload.body?.data) {
//         return Buffer.from(payload.body.data, 'base64').toString('utf-8');
//       }
//       return '';
//     };

//     body = getBodyFromPayload(fullMsg.data.payload);
//         return {
//           id: msg.id,
//           subject,
//           from,
//            body,
//         };
//       })
//     );

//     return res.json({
//       profile: profile.data,
//       emails: messageDetails,
//     });
//   } catch (err) {
//     console.error('Error in token login route:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.get('/login-with-token/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // Set the stored refresh token
    oAuth2Client.setCredentials({ refresh_token: user.refresh_token });

    let accessToken;
    try {
      // Try to get a new access token
      const { token } = await oAuth2Client.getAccessToken();
      accessToken = token;
    } catch (err) {
      if (err.response?.data?.error === 'invalid_grant') {
        // Refresh token expired or revoked
        return res.status(401).json({
          message: 'Refresh token expired or revoked. Please login again.',
        });
      } else {
        throw err; // other errors
      }
    }

    // Save new access token and expiry
    user.access_token = accessToken;
    user.expiry_date = Date.now() + 3600 * 1000; // 1 hour
    await user.save();

    oAuth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Get profile
    const profile = await gmail.users.getProfile({ userId: 'me' });

    // Get list of messages from inbox
    const messageListResponse = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 100,
    });

    const messages = messageListResponse.data.messages || [];

    // Fetch subject/snippet for each message
    const messageDetails = await Promise.all(
      messages.map(async (msg) => {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const headers = fullMsg.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name === 'From')?.value || '(No Sender)';

        // Extract body
        const getBodyFromPayload = (payload) => {
          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                return Buffer.from(part.body.data, 'base64').toString('utf-8');
              }
            }
          } else if (payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString('utf-8');
          }
          return '';
        };

        const body = getBodyFromPayload(fullMsg.data.payload);

        return { id: msg.id, subject, from, body };
      })
    );

    return res.json({ profile: profile.data, emails: messageDetails });
  } catch (err) {
    console.error('Error in token login route:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/exists/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json({ exists: !!user });
});


module.exports = router;
