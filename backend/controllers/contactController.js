const Contact = require('../models/ContactNewModel');
const Account = require('../models/AccountNewModel');
const { sendActivationEmail } = require('../utils/emailService');

// Create new contact
exports.createContact = async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, contactName, email, password, accountId,
      companyName, note, ssn, tags, country, streetAddress, city, state, 
      postalCode, phoneNumbers, active, login,personalMessage  // Added login here
    } = req.body;

    let existing = await Contact.findOne({ email });
    if (existing) return res.status(409).json({ error: "Contact email is already taken" });

    const contact = new Contact({
      firstName, middleName, lastName, contactName, email, companyName, 
      note, ssn, tags, country, streetAddress, city, state, postalCode, 
      phoneNumbers, active,
      accountIds: accountId ? [accountId] : []
    });

    // If login is enabled, generate activation token and handle password
    if (login) {
      // Generate activation token
      contact.generateActivationToken();
      
      // Don't set password until activation (more secure)
      contact.password = undefined;
    } else {
      // If login is not enabled, you can set a password or leave it empty
      if (password) {
        contact.password = password;
      }
    }

    await contact.save();

    // Send activation email if login is enabled
    if (login) {
      try {
        await sendActivationEmail(
          contact.email, 
          contact.activationToken,
          `${contact.firstName} ${contact.lastName}`,
personalMessage
        );
        
        console.log(`Activation email sent to ${contact.email}`);
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update contact (can be used to add accountId or set password)
exports.updateContact = async (req, res) => {
  try {
    const { firstName, lastName, email, accountId, password, login } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    if (firstName !== undefined) contact.firstName = firstName;
    if (lastName !== undefined) contact.lastName = lastName;
    if (email !== undefined) contact.email = email;
    
    // Handle password update
    if (password !== undefined) {
      contact.password = password;
    }

    // Handle login activation
    if (login && !contact.isActivated) {
      contact.generateActivationToken();
      // Send activation email
      try {
        await sendActivationEmail(
          contact.email, 
          contact.activationToken,
          `${contact.firstName} ${contact.lastName}`
        );
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
      }
    }

    if (accountId && !contact.accountIds.includes(accountId)) {
      contact.accountIds.push(accountId);
    }

    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update full contact details
exports.updateContactwithoutPassword = async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedContact)
      return res.status(404).json({ error: "Contact not found" });

    res.json({
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().populate("tags", "tagName tagColour").sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContacts = async (req, res) => {
  try {
    const { ids } = req.body; // expecting array of contact IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No contact IDs provided" });
    }

    // ? 1. Remove contact references from accounts
    await Account.updateMany(
      { "contacts.contact": { $in: ids } },
      { $pull: { contacts: { contact: { $in: ids } } } }
    );

    // ? 2. Delete contacts from DB
    await Contact.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      message: "Contacts deleted and references removed from accounts successfully",
    });
  } catch (error) {
    console.error("Delete contacts error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Verify activation token
exports.verifyActivationToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const contact = await Contact.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: new Date() }
    });
    
    if (!contact) {
      return res.status(400).json({ 
        error: 'Invalid or expired activation token' 
      });
    }
    
    res.json({ 
      success: true, 
      contact: { 
        email: contact.email,
        name: `${contact.firstName} ${contact.lastName}`
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate and set password
exports.activateAndSetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const contact = await Contact.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: new Date() }
    });
    
    if (!contact) {
      return res.status(400).json({ 
        error: 'Invalid or expired activation token' 
      });
    }
    
    // Update password and activate account
    contact.password = password;
    contact.activateAccount();
    
    await contact.save();
    
    res.json({ 
      success: true, 
      message: 'Password set successfully. Your account is now active.' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resend activation email
exports.resendActivationEmail = async (req, res) => {
  try {
    const { contactId } = req.params;
const { personalMessage } = req.body;
    
    const contact = await Contact.findById(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
   // if (contact.isActivated) {
    //  return res.status(400).json({ error: 'Account is already activated' });
   // }
    
    // Generate new token
    contact.generateActivationToken();
    await contact.save();
    
    // Send activation email
    await sendActivationEmail(
      contact.email, 
      contact.activationToken,
      `${contact.firstName} ${contact.lastName}`,
 personalMessage
    );
    
    res.json({ success: true, message: 'Activation email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contacts with only _id and contactName
exports.getContactNames = async (req, res) => {
  try {
    const contacts = await Contact.find({}, "_id contactName email")
      .sort({ contactName: 1 }); // Optional: alphabetical sorting

    res.json({
      success: true,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get full contact details by ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id).populate("tags", "tagName tagColour")
     
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({
      success: true,
      data: contact,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

