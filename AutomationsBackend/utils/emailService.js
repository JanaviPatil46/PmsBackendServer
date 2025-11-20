const nodemailer = require('nodemailer');
const secretKey = process.env.TOKEN_KEY;
require('dotenv').config();
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
        },});

exports.sendActivationEmail = async (email, activationToken, contactName) => {
  //const activationUrl = `${process.env.CLIENT_URL}/client/updatepassword/${activationToken}`;
  const activationUrl = `https://snptaxes.com/client/client/updatepassword/${activationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Activate Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Activation Required</h2>
        <p>Hello ${contactName},</p>
        <p>Your account has been created. Please click the link below to set your password and activate your account:</p>
        <p>
          <a href="${activationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Activate Account
          </a>
        </p>
                <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (email, resetToken, contactName) => {
  const resetUrl = `https://snptaxes.com/client/client/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${contactName},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
               <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        <br>
        <p><small>For security reasons, this link will expire after 1 hour.</small></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};