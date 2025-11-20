const { google } = require('googleapis');
const User = require('../models/User');
require('dotenv').config();

const getGmailClientForUser = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    expiry_date: user.expiry_date
  });

  oAuth2Client.on('tokens', async (tokens) => {
    await User.updateOne({ email }, {
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date
    });
  });

  return google.gmail({ version: 'v1', auth: oAuth2Client });
};

module.exports = { getGmailClientForUser };
