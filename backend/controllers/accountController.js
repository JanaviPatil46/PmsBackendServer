
const mongoose = require("mongoose")
const Account = require('../models/AccountNewModel');
const ClientContact = require("../models/ContactNewModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create account (empty contacts array)
exports.createAccount = async (req, res) => {
  try {
    const { accountName, clientType, companyName,teamMember,tags,folderTemp,country,streetAddress,city,state,postalCode,adminUserId,active } = req.body;
    const existing = await Account.findOne({ accountName });
    if (existing) return res.status(409).json({ error: "Account name is taken" });

    const account = new Account({
      accountName, clientType, companyName,teamMember,tags,folderTemp,country,streetAddress,city,state,postalCode,adminUserId,active 
    });
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateAccount = async (req, res) => {
  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAccount)
      return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Account updated successfully", account: updatedAccount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().populate('contacts.contact', 'email').sort({ createdAt: -1 })

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
require('../models/tagModel')


// Get accounts list by active/archive status
exports.getAccountsList = async (req, res) => {
  try {
    const { active } = req.query; // expects ?active=true or ?active=false

    // Convert string to boolean
    const isActive = active === "true";

    const accounts = await Account.find({ active: isActive })
      .populate("contacts.contact", "email").populate("tags", "tagName tagColour") // populate tags
      .populate("teamMember", "username").sort({ createdAt: -1 });

   res.status(200).json({ accountlist: accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ? Get accounts assigned to a specific team member
exports.getAccountsByTeamMember = async (req, res) => {
  try {
    const { userId, active } = req.query; 
    // ?userId=64ae...&active=true

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const isActive = active === "true";

    const accounts = await Account.find({
      teamMember: userId,
      active: isActive
    })
      .populate("contacts.contact", "email")
      .populate("tags", "tagName tagColour")
      .populate("teamMember", "username").sort({ createdAt: -1 });

    res.status(200).json({ success: true, accountlist: accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const jwt = require('jsonwebtoken');
// const Account = require('../models/AccountNewModel');

exports.getAccountById = async (req, res) => {
  try {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) return res.status(401).json({ message: 'Unauthorized' });

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accountId = req.params.id;

    const account = await Account.findById(accountId).populate({
        path: "contacts.contact",
        populate: {
          path: "tags",
          select: "tagName tagColour"
        }
      });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleContactLogin = async (req, res) => {
  const { accountId, contactId } = req.params;
  const { canLogin, canNotify, canEmailSync } = req.body; // ? receive all 3

  try {
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Find the contact inside the account's contacts array
    const contactEntry = account.contacts.find(
      (c) => c.contact.toString() === contactId
    );

    if (!contactEntry)
      return res
        .status(404)
        .json({ message: "Contact not found in this account" });

    // ? Update only the field sent from frontend
    if (canLogin !== undefined) contactEntry.canLogin = canLogin;
    if (canNotify !== undefined) contactEntry.canNotify = canNotify;
    if (canEmailSync !== undefined) contactEntry.canEmailSync = canEmailSync;

    await account.save();

    res.json({
      message: "Contact permissions updated",
      contact: contactEntry,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAccountActiveStatus = async (req, res) => {
  try {
    const { ids, active } = req.body; // multiple accounts in bulk

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Account IDs are required" });
    }

    await Account.updateMany(
      { _id: { $in: ids } },
      { $set: { active } }
    );

    res.json({
      success: true,
      message: active ? "Account activated successfully" : "Account archived successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Get accounts with only _id and accountName
exports.getAccountNames = async (req, res) => {
  try {
    const accounts = await Account.find({}, "_id accountName");

    res.status(200).json({
      success: true,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get only ID + name based on active status
exports.getAccountNamesByStatus = async (req, res) => {
  try {
    const { active } = req.query; // ?active=true / ?active=false
    const isActive = active === "true";

    const accounts = await Account.find(
      { active: isActive },
      "_id accountName"
    );

    res.status(200).json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addContactsToAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: 'Contacts array is required'
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Validate each contact
    const validationErrors = [];
    const contactsToAdd = [];
    const contactIds = [];

    for (const contactData of contacts) {
      if (!contactData.contact) {
        validationErrors.push('Contact ID is required for each contact');
        continue;
      }

      // Check if contact already exists in account
      const existingContact = account.contacts.find(
        c => c.contact.toString() === contactData.contact
      );

      if (existingContact) {
        validationErrors.push(`Contact ${contactData.contact} already exists in this account`);
        continue;
      }

      contactsToAdd.push({
        contact: contactData.contact,
        canLogin: contactData.canLogin || false,
        canNotify: contactData.canNotify !== undefined ? contactData.canNotify : false,
        canEmailSync: contactData.canEmailSync || false
      });

      contactIds.push(contactData.contact);
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (contactsToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts to add'
      });
    }

    // Add new contacts to account
    account.contacts.push(...contactsToAdd);
    await account.save();

    // Update each contact with the account ID
    await ClientContact.updateMany(
      { _id: { $in: contactIds } },
      { 
        $addToSet: { accountIds: accountId }, // Use $addToSet to avoid duplicates
        $set: { updatedAt: new Date() }
      }
    );

    // Populate the newly added contacts
    //await account.populate('contacts.contact', 'firstName lastName email phone');

    res.status(200).json({
      success: true,
      message: `${contactsToAdd.length} contact(s) added successfully and contacts updated with account reference`,
      data: account.contacts
    });

  } catch (error) {
    console.error('Error adding contacts to account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Remove contact from account
// @route   DELETE /api/accounts/:accountId/contact/:contactId
// @access  Private
exports.removeContactFromAccount = async (req, res) => {
  try {
    const { accountId, contactId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const contactIndex = account.contacts.findIndex(
      c => c.contact.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found in this account'
      });
    }

    const removedContact = account.contacts.splice(contactIndex, 1)[0];
    await account.save();

    // Also remove the account ID from the contact's accounts array
    await ClientContact.findByIdAndUpdate(
      contactId,
      {
        $pull: { accountIds: accountId } // Remove this account from contact's accounts array
      }
    );

    res.status(200).json({
      success: true,
      message: 'Contact removed from account successfully',
      data: {
        contactId: removedContact.contact,
        accountId: account._id
      }
    });

  } catch (error) {
    console.error('Error removing contact from account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
exports.getAccountContacts = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId)
      .populate('contacts.contact', 'firstName lastName email phone position department')
      .select('contacts');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account.contacts,
      count: account.contacts.length
    });

  } catch (error) {
    console.error('Error fetching account contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
exports.updateAccountTags = async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body; // Expecting an array of tag IDs

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Account ID" });
  }

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: "Tags must be an array" });
  }

  try {
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: "No such Account" });
    }

    // Update only the tags field
    account.tags = tags;
    await account.save();

    res.status(200).json({ message: "Account tags updated successfully", account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMultipleAccounts = async (req, res) => {
  try {
    const { accountIds } = req.body;

    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one accountId in an array",
      });
    }

    // Get all accounts being deleted
    const accounts = await Account.find({ _id: { $in: accountIds } });

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    // Collect all contact IDs linked to the accounts
    const allContactIds = accounts.flatMap(acc =>
      acc.contacts.map(contact => contact.contact)
    );

    // Remove account references from contacts
    if (allContactIds.length > 0) {
      await ClientContact.updateMany(
        { _id: { $in: allContactIds } },
        { $pull: { accountIds: { $in: accountIds } } } // Remove each account id
      );
    }

    // Delete all accounts
    const deleteResult = await Account.deleteMany({ _id: { $in: accountIds } });

    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} account(s) deleted successfully`,
    });

  } catch (error) {
    console.error("Error deleting accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting accounts",
      error: error.message,
    });
  }
};

exports.sendBulkEmails = async (req, res) => {
  const { selectedAccounts, emailtemplateid, notificationemail, emailsubject, emailbody } = req.body;
  console.log("request body", req.body);

  if (!emailtemplateid || !selectedAccounts?.length) {
    return res.status(400).json({ status: 400, message: "Please provide all data." });
  }

  try {
    // ?? Date preparations
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(currentDate.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    const formatDate = (date) => ({
      FULL_DATE: date.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
      DAY_NUMBER: date.getDate(),
      DAY_NAME: date.toLocaleDateString("en-US", { weekday: "long" }),
      MONTH_NUMBER: date.getMonth() + 1,
      MONTH_NAME: date.toLocaleDateString("en-US", { month: "long" }),
      QUARTER: Math.floor((date.getMonth() + 3) / 3),
      YEAR: date.getFullYear(),
    });

    const current = formatDate(currentDate);
    const last = formatDate(lastDay);
    const next = formatDate(nextDay);

    // ?? Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    let totalEmails = 0;
    let emailsSent = 0;
    let missingContacts = [];

    for (const accountId of selectedAccounts) {
      const account = await Account.findById(accountId).populate("contacts.contact");
      if (!account) continue;

     for (const contactObj of account.contacts) {
        const contact = contactObj.contact;
        if (!contact || !contact.email) {
          missingContacts.push(account.accountName);
          continue;
        }
        totalEmails++;

       if (contactObj.canEmailSync === true) {

          const replacePlaceholders = (template, data) =>
            template.replace(/\[([\w\s]+)\]/g, (_, key) => data[key.trim()] || "");

          const placeholders = {
            ACCOUNT_NAME: account.accountName,
            FIRST_NAME: contact.firstName || "",
            LAST_NAME: contact.lastName || "",
            COMPANY_NAME: contact.companyName || "",
            EMAIL: contact.email || "",
            CITY: contact.city || "",
            STATE: contact.state || "",
            COUNTRY: contact.country || "",
            PHONE: contact.phoneNumbers || "",
            ZIPPOSTALCODE: contact.postalCode || "",
            CURRENT_DAY_FULL_DATE: current.FULL_DATE,
            CURRENT_DAY_NAME: current.DAY_NAME,
            CURRENT_MONTH_NAME: current.MONTH_NAME,
            CURRENT_YEAR: current.YEAR,
            LAST_DAY_FULL_DATE: last.FULL_DATE,
            NEXT_DAY_FULL_DATE: next.FULL_DATE,
          };

          const mailBody = replacePlaceholders(emailbody, placeholders);
          const mailSubject = replacePlaceholders(emailsubject, placeholders);

          const htmlPage = `
            <!doctype html>
            <html lang="en">
            <body style="font-family:Arial,sans-serif;padding:20px;color:#333;">
              <h2 style="color:#2e6c80;">${mailSubject}</h2>
              <div>${mailBody}</div>
              <p style="margin-top:30px;">Regards,<br><b>SNP Tax & Financials</b></p>
            </body>
            </html>`;

          try {
            await transporter.sendMail({
              from: process.env.EMAIL,
              to: contact.email,
              subject: mailSubject,
              html: htmlPage,
            });
            emailsSent++;
          } catch (err) {
            console.error("? Error sending to:", contact.email, err.message);
          }
        } else {
          console.log(`Skipped ${contact.email} - emailSync is false`);
        }
      }
    }

    // ?? Notify admin after all
    if (notificationemail) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: notificationemail,
        subject: "Bulk Email Sending Complete",
        html: `
          <p><b>Bulk Email Report</b></p>
          <p>? Emails Sent: ${emailsSent}</p>
          <p>?? Total Accounts: ${selectedAccounts.length}</p>
          <p>?? Missing/Invalid Contacts: ${missingContacts.join(", ") || "None"}</p>
        `,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Bulk email process completed",
      summary: { totalEmails, emailsSent, missingContacts },
    });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    res.status(500).json({ status: 500, message: "Server error", error: error.message });
  }
};

exports.assignBulkTagsToMultipleAccount = async (req, res) => {
  const { accounts, tags } = req.body;

  
  try {
    await Account.updateMany(
      { _id: { $in: accounts } },
      { $addToSet: { tags: { $each: tags } } } // avoids duplicates
    );

    res.status(200).json({ message: "Tags assigned successfully." });
  } catch (error) {
    console.error("Error assigning tags:", error);
    res
      .status(500)
      .json({ message: "Error assigning tags", error: error.message });
  }
};

/**
 * Remove bulk tags from multiple accounts
 */
exports.removeBulkTagsFromAccounts = async (req, res) => {
  const { accounts, tags } = req.body;

   try {
    await Account.updateMany(
      { _id: { $in: accounts } },
      { $pull: { tags: { $in: tags } } } // removes matching tags
    );

    res.status(200).json({ message: "Tags removed successfully." });
  } catch (error) {
    console.error("Error removing tags:", error);
    res
      .status(500)
      .json({ message: "Error removing tags", error: error.message });
  }
};
/**
 * Assign multiple team members to multiple accounts
 */
exports.assignTeamMembersToMultipleAccounts = async (req, res) => {
  const { accounts, teamMembers } = req.body;

 
  try {
    const result = await Account.updateMany(
      { _id: { $in: accounts } },
      { $addToSet: { teamMember: { $each: teamMembers } } } // avoids duplicates
    );

    res.status(200).json({
      message: "Team members assigned successfully.",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error assigning team members:", error);
    res
      .status(500)
      .json({ message: "Error assigning team members", error: error.message });
  }
};

/**
 * Remove multiple team members from multiple accounts
 */
exports.removeTeamMembersFromAccounts = async (req, res) => {
  const { accounts, teamMembers } = req.body;

  
  try {
    const result = await Account.updateMany(
      { _id: { $in: accounts } },
      { $pull: { teamMember: { $in: teamMembers } } } // removes matching team members
    );

    res.status(200).json({
      message: "Team members removed successfully.",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error removing team members:", error);
    res
      .status(500)
      .json({ message: "Error removing team members", error: error.message });
  }
};

exports.getMultipleAccountsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting: { "ids": ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Account IDs are required in an array." });
    }

    const accounts = await Account.find({ _id: { $in: ids } }).populate({
      path: "contacts.contact",
      populate: {
        path: "tags",
        select: "tagName tagColour"
      }
    });

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ message: "No accounts found" });
    }

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


