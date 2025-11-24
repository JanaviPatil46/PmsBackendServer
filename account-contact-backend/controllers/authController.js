// controllers/authController.js
const Contact = require('../models/ContactNewModel');
const Account = require('../models/AccountNewModel');
const { sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const contact = await Contact.findOne({ email });
//     if (!contact) return res.status(401).json({ message: 'Invalid credentials' });

//     const isMatch = await contact.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     // Find accounts where contact.canLogin is true
//     const accounts = await Account.find({
//       contacts: { $elemMatch: { contact: contact._id, canLogin: true } }
//     }).select('accountName clientType companyName');

//     if (accounts.length === 0) {
//       return res.status(403).json({ message: 'No accounts enabled for login' });
//     }

//     res.status(200).json({
//       message: 'Login successful',
//       contact: {
//         id: contact._id,
//         firstName: contact.firstName,
//         lastName: contact.lastName,
//         email: contact.email
//       },
//       accounts
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
console.log("email",email)
console.log("password",password)
    const contact = await Contact.findOne({ email });
    if (!contact) return res.status(401).json({ message: 'Invalid credentials' });
// ? Check if password is empty or missing in DB
    if (!contact.password || contact.password.trim() === "") {
      return res.status(400).json({ 
        message: 'Your account is not activated. Please contact admin.' 
      });
    }
    const isMatch = await contact.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accounts = await Account.find({
      contacts: { $elemMatch: { contact: contact._id, canLogin: true } }
    }).select('accountName clientType companyName');

    if (accounts.length === 0) {
      return res.status(403).json({ message: 'No accounts enabled for login' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: contact._id,
      email: contact.email
    };
   // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
 const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({
      message: 'Login successful',
      token,  // Return JWT token here
      contact: {
        id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email
      },
      accounts
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password - generate reset token and send email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find contact by email
    const contact = await Contact.findOne({ email });
    
    // For security, don't reveal if email exists or not
    if (!contact) {
      return res.json({ 
        success: true, 
        message: 'If the email exists, password reset instructions have been sent.' 
      });
    }

    // Check if contact has login enabled
    if (!contact.isActivated) {
      return res.status(400).json({ 
        error: 'Account is not activated. Please activate your account first.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token to contact
    contact.resetToken = resetToken;
    contact.resetTokenExpires = resetTokenExpires;
    await contact.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        contact.email,
        resetToken,
        `${contact.firstName} ${contact.lastName}`
      );
      
      console.log(`Password reset email sent to ${contact.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send reset email. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Password reset instructions have been sent to your email.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const contact = await Contact.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!contact) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    res.json({ 
      success: true, 
      user: { 
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`
      } 
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password strength (optional but recommended)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const contact = await Contact.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!contact) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Update password
    contact.password = password;
    
    // Clear reset token
    contact.resetToken = undefined;
    contact.resetTokenExpires = undefined;
    
    // Ensure account is active
    contact.active = true;
    contact.isActivated = true;

    await contact.save();

    res.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};