const OrganizerAccountWise = require("../models/organizerAccountwiseModel");
const Accounts = require("../models/AccountModel");
const Contacts = require("../models/contactsModel");
const mongoose = require("mongoose");
const OrganizerTemplate = require("../models/organizerTempModel");
const nodemailer = require("nodemailer");
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const currentDate = new Date();
const lastDay = new Date(currentDate);
lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day
const nextDay = new Date(currentDate);
nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

// Define options for formatting date
const options = {
  weekday: "long", // Full name of the day of the week (e.g., "Monday")
  day: "2-digit", // Two-digit day of the month (01 through 31)
  month: "long", // Full name of the month (e.g., "January")
  year: "numeric", // Four-digit year (e.g., 2022)
  week: "numeric", // ISO week of the year (1 through 53)
  monthNumber: "2-digit", // Two-digit month number (01 through 12)
  quarter: "numeric", // Quarter of the year (1 through 4)
};

// Format the current date using options
const currentFullDate = currentDate.toLocaleDateString("en-US", options);
const currentDayNumber = currentDate.getDate();
const currentDayName = currentDate.toLocaleDateString("en-US", {
  weekday: "long",
});
const currentWeek = currentDate.toLocaleDateString("en-US", {
  week: "numeric",
});
const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
const currentMonthName = currentDate.toLocaleDateString("en-US", {
  month: "long",
});
const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // Calculate the quarter
const currentYear = currentDate.getFullYear();

// Format the last day using options
const lastDayFullDate = lastDay.toLocaleDateString("en-US", options);
const lastDayNumber = lastDay.getDate();
const lastDayName = lastDay.toLocaleDateString("en-US", { weekday: "long" });
const lastWeek = lastDay.toLocaleDateString("en-US", { week: "numeric" });
const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
const lastMonthName = lastDay.toLocaleDateString("en-US", { month: "long" });
const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
const lastYear = lastDay.getFullYear();

// Format the next day using options
const nextDayFullDate = nextDay.toLocaleDateString("en-US", options);
const nextDayNumber = nextDay.getDate();
const nextDayName = nextDay.toLocaleDateString("en-US", { weekday: "long" });
const nextWeek = nextDay.toLocaleDateString("en-US", { week: "numeric" });
const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
const nextMonthName = nextDay.toLocaleDateString("en-US", { month: "long" });
const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
const nextYear = nextDay.getFullYear();
//get all OrganizerAccountWise
const getOrganizerAccountWises = async (req, res) => {
  try {
    const organizerAccountWise = await OrganizerAccountWise.find();

    res
      .status(200)
      .json({
        message: "OrganizerAccountWise Template retrieved successfully",
        organizerAccountWise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single OrganizerAccountWise
const getOrganizerAccountWise = async (req, res) => {
  try {
    const organizerAccountWise = await OrganizerAccountWise.findById(
      req.params.id
    );
    if (!organizerAccountWise) {
      return res.status(404).send();
    }
    res
      .status(200)
      .json({
        message: "Organizer AccountWise retrieved successfully",
        organizerAccountWise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//POST a new OrganizerAccountWise

const createOrganizerAccountWise = async (req, res) => {
  try {
    // Save the organizer account-wise data
    const newOrganizerAccountWise = new OrganizerAccountWise(req.body);
    await newOrganizerAccountWise.save();

    // Fetch the account with populated contacts.contact
    const account = await Accounts.findById(newOrganizerAccountWise.accountid)
      .populate("contacts.contact");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const organizertemp = await OrganizerTemplate.findById(
      newOrganizerAccountWise.organizertemplateid
    );

    if (!organizertemp) {
      return res.status(404).json({ error: "Organizer template not found" });
    }

    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    const missingContactsAccounts = [];
    const organizerLink = `http://localhost:3000/organizers/update/${newOrganizerAccountWise._id}`;

    // Create reusable transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const organizerName = replacePlaceholders(organizertemp.organizerName, {
      ACCOUNT_NAME: account.accountName,
      CURRENT_DAY_FULL_DATE: currentFullDate,
      CURRENT_DAY_NUMBER: currentDayNumber,
      CURRENT_DAY_NAME: currentDayName,
      CURRENT_WEEK: currentWeek,
      CURRENT_MONTH_NUMBER: currentMonthNumber,
      CURRENT_MONTH_NAME: currentMonthName,
      CURRENT_QUARTER: currentQuarter,
      CURRENT_YEAR: currentYear,
      LAST_DAY_FULL_DATE: lastDayFullDate,
      LAST_DAY_NUMBER: lastDayNumber,
      LAST_DAY_NAME: lastDayName,
      LAST_WEEK: lastWeek,
      LAST_MONTH_NUMBER: lastMonthNumber,
      LAST_MONTH_NAME: lastMonthName,
      LAST_QUARTER: lastQuarter,
      LAST_YEAR: lastYear,
      NEXT_DAY_FULL_DATE: nextDayFullDate,
      NEXT_DAY_NUMBER: nextDayNumber,
      NEXT_DAY_NAME: nextDayName,
      NEXT_WEEK: nextWeek,
      NEXT_MONTH_NUMBER: nextMonthNumber,
      NEXT_MONTH_NAME: nextMonthName,
      NEXT_QUARTER: nextQuarter,
      NEXT_YEAR: nextYear,
    });

    // Send emails to all eligible contacts
    const emailResults = await Promise.allSettled(
      account.contacts.map(async (c) => {
        const contact = c.contact;
        if (!contact || !contact.email) {
          missingContactsAccounts.push(account.accountName);
          return null;
        }

        const mailOptions = {
          from: process.env.EMAIL,
          to: contact.email,
          subject: "New Organizer Created for You",
          html: `
            <p>Hello ${account.accountName},</p>
            <p>We have created an organizer for you: <b>${organizerName}</b></p>
            <p>Please click below to access it:</p>
            <a href="${organizerLink}">View organizer</a>
            <br/><br/>
            <p>If the button doesn't work, copy this URL:</p>
            <p>${organizerLink}</p>
          `
        };

        return await transporter.sendMail(mailOptions);
      })
    );

    console.log("Email sending results:", emailResults);

    // Notify admin if any contacts were missing email
    if (missingContactsAccounts.length > 0) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: process.env.EMAIL,
          subject: "Organizer creation: Missing contact emails",
          html: `
            <p>The following account has contacts without email addresses:</p>
            <p>${missingContactsAccounts.join(", ")}</p>
          `,
        });
        console.log("Notification email sent for missing contacts");
      } catch (err) {
        console.error("Failed to send missing-contact notification:", err.message);
      }
    }

    return res.status(201).json({
      message: "OrganizerAccountWise created successfully and emails processed.",
      newOrganizerAccountWise,
      missingEmailAccounts: missingContactsAccounts,
    });

  } catch (error) {
    console.error("Error creating OrganizerAccountWise:", error);
    return res.status(500).json({
      error: "Error creating OrganizerAccountWise or sending emails",
      details: error.message,
    });
  }
};

//delete a OrganizerAccountWise

const deleteOrganizerAccountWise = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid OrganizerAccountWise ID" });
  }

  try {
    const deletedOrganizerAccountWise =
      await OrganizerAccountWise.findByIdAndDelete({ _id: id });
    if (!deletedOrganizerAccountWise) {
      return res.status(404).json({ error: "No such OrganizerAccountWise" });
    }
    res
      .status(200)
      .json({
        message: "OrganizerAccountWise deleted successfully",
        deletedOrganizerAccountWise,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// //Get a single OrganizerAccountWise

// const getOrganizerByAccountId = async (req, res) => {
//   try {
//     const organizerAccountWise = await OrganizerAccountWise.find({ accountid: req.params.id })
//       .populate({ path: "accountid", model: "Accounts" }) // Populate the account details if needed
//       .populate({ path: "organizertemplateid", model: "OrganizerTemplate" }); // Populate the organizer template details if needed
//     // .populate({ path: 'jobid', model: 'Job' }); // Populate the job details if needed

//     if (!organizerAccountWise) {
//       return res.status(404).json({ error: "Organizer AccountWise not found" });
//     }

//     res.status(200).json({ message: "Organizer AccountWise retrieved successfully", organizerAccountWise });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const getOrganizerByAccountId = async (req, res) => {
  try {
    const organizerAccountWise = await OrganizerAccountWise.find({
      accountid: req.params.id,
    })
      .populate({ path: "accountid", model: "clientAccount" })
      .populate({ path: "organizertemplateid", model: "OrganizerTemplate" });

    if (!organizerAccountWise) {
      return res.status(404).json({ error: "Organizer AccountWise not found" });
    }

    // Function to process organizer data
    const processOrganizerData = async (organizerAccountWise) => {
      for (const organizer of organizerAccountWise) {
        // console.log(organizer.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          organizer.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${organizer.accountid._id}`);
          continue; // Skip processing this organizer if account is not found
        }

        // Filter contacts with emailSync enabled
        // const validContact = account.contacts.filter(
        //   (contact) => contact.emailSync
        // );
        // console.log(validContact);

        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
          // FIRST_NAME: validContact[0]?.firstName || "",
          // MIDDLE_NAME: validContact[0]?.middleName || "",
          // LAST_NAME: validContact[0]?.lastName || "",
          // CONTACT_NAME: validContact[0]?.contactName || "",
          // COMPANY_NAME: validContact[0]?.companyName || "",
          // COUNTRY: validContact[0]?.country || "",
          // STREET_ADDRESS: validContact[0]?.streetAddress || "",
          // STATEPROVINCE: validContact[0]?.state || "",
          // PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
          // ZIPPOSTALCODE: validContact[0]?.postalCode || "",
          // CITY: validContact[0]?.city || "",
          CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
          CURRENT_DAY_NUMBER: new Date().getDate(),
          CURRENT_DAY_NAME: new Date().toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
          CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: new Date().getFullYear(),
          LAST_DAY_FULL_DATE: lastDayFullDate,
          LAST_DAY_NUMBER: lastDayNumber,
          LAST_DAY_NAME: lastDayName,
          LAST_WEEK: lastWeek,
          LAST_MONTH_NUMBER: lastMonthNumber,
          LAST_MONTH_NAME: lastMonthName,
          LAST_QUARTER: lastQuarter,
          LAST_YEAR: lastYear,
          NEXT_DAY_FULL_DATE: nextDayFullDate,
          NEXT_DAY_NUMBER: nextDayNumber,
          NEXT_DAY_NAME: nextDayName,
          NEXT_WEEK: nextWeek,
          NEXT_MONTH_NUMBER: nextMonthNumber,
          NEXT_MONTH_NAME: nextMonthName,
          NEXT_QUARTER: nextQuarter,
          NEXT_YEAR: nextYear,
        };

        // Function to replace placeholders in text
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || "";
          });
        };

        // Replace placeholders in the organizer's template
        if (organizer.organizertemplateid) {
          organizer.organizertemplateid.organizerName = replacePlaceholders(
            organizer.organizertemplateid.organizerName || "",
            placeholderValues
          );
        }
      }
    };

    // Call the function to process organizer data
    await processOrganizerData(organizerAccountWise);

    res
      .status(200)
      .json({
        message: "Organizer AccountWise retrieved successfully",
        organizerAccountWise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveOrganizerByAccountId = async (req, res) => {
  try {
    // console.log(req.params.id)
    const organizerAccountWise = await OrganizerAccountWise.find({
      accountid: req.params.id,
      active : req.params.isactive,
    })
      .populate({ path: "accountid", model: "clientAccount" })
      .populate({ path: "organizertemplateid", model: "OrganizerTemplate" });

    if (!organizerAccountWise) {
      return res.status(404).json({ error: "Organizer AccountWise not found" });
    }

    // Function to process organizer data
    const processOrganizerData = async (organizerAccountWise) => {
      for (const organizer of organizerAccountWise) {
        // console.log(organizer.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          organizer.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${organizer.accountid._id}`);
          continue; // Skip processing this organizer if account is not found
        }

        // Filter contacts with emailSync enabled
        // const validContact = account.contacts.filter(
        //   (contact) => contact.emailSync
        // );
        // console.log(validContact);

        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
          // FIRST_NAME: validContact[0]?.firstName || "",
          // MIDDLE_NAME: validContact[0]?.middleName || "",
          // LAST_NAME: validContact[0]?.lastName || "",
          // CONTACT_NAME: validContact[0]?.contactName || "",
          // COMPANY_NAME: validContact[0]?.companyName || "",
          // COUNTRY: validContact[0]?.country || "",
          // STREET_ADDRESS: validContact[0]?.streetAddress || "",
          // STATEPROVINCE: validContact[0]?.state || "",
          // PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
          // ZIPPOSTALCODE: validContact[0]?.postalCode || "",
          // CITY: validContact[0]?.city || "",
          CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
          CURRENT_DAY_NUMBER: new Date().getDate(),
          CURRENT_DAY_NAME: new Date().toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
          CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: new Date().getFullYear(),
          LAST_DAY_FULL_DATE: lastDayFullDate,
          LAST_DAY_NUMBER: lastDayNumber,
          LAST_DAY_NAME: lastDayName,
          LAST_WEEK: lastWeek,
          LAST_MONTH_NUMBER: lastMonthNumber,
          LAST_MONTH_NAME: lastMonthName,
          LAST_QUARTER: lastQuarter,
          LAST_YEAR: lastYear,
          NEXT_DAY_FULL_DATE: nextDayFullDate,
          NEXT_DAY_NUMBER: nextDayNumber,
          NEXT_DAY_NAME: nextDayName,
          NEXT_WEEK: nextWeek,
          NEXT_MONTH_NUMBER: nextMonthNumber,
          NEXT_MONTH_NAME: nextMonthName,
          NEXT_QUARTER: nextQuarter,
          NEXT_YEAR: nextYear,
        };

        // Function to replace placeholders in text
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || "";
          });
        };

        // Replace placeholders in the organizer's template
        if (organizer.organizertemplateid) {
          organizer.organizertemplateid.organizerName = replacePlaceholders(
            organizer.organizertemplateid.organizerName || "",
            placeholderValues
          );
        }
        organizer.organizerName = replacePlaceholders(organizer.organizerName || "",placeholderValues)
      }
    };

    // Call the function to process organizer data
    await processOrganizerData(organizerAccountWise);

    res
      .status(200)
      .json({
        message: "Organizer AccountWise retrieved successfully",
        organizerAccountWise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message})}
};
const getPendingOrganizersByAccountId = async (req, res) => {
  try {
    const { id } = req.params; // Account ID
    const pendingOrganizers = await OrganizerAccountWise.find({
      accountid: id,
      status: 'Pending',
    })
      .populate({ path: "accountid", model: "clientAccount" })
      .populate({ path: "organizertemplateid", model: "OrganizerTemplate" });

    if (!pendingOrganizers || pendingOrganizers.length === 0) {
      return res.status(404).json({ message: "No pending organizers found for this account" });
    }
    // Function to process organizer data
    const processOrganizerData = async (pendingOrganizers) => {
      for (const organizer of pendingOrganizers) {
        // console.log(organizer.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          organizer.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${organizer.accountid._id}`);
          continue; // Skip processing this organizer if account is not found
        }

        // Filter contacts with emailSync enabled
        // const validContact = account.contacts.filter(
        //   (contact) => contact.emailSync
        // );
        // console.log(validContact);

        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
          // FIRST_NAME: validContact[0]?.firstName || "",
          // MIDDLE_NAME: validContact[0]?.middleName || "",
          // LAST_NAME: validContact[0]?.lastName || "",
          // CONTACT_NAME: validContact[0]?.contactName || "",
          // COMPANY_NAME: validContact[0]?.companyName || "",
          // COUNTRY: validContact[0]?.country || "",
          // STREET_ADDRESS: validContact[0]?.streetAddress || "",
          // STATEPROVINCE: validContact[0]?.state || "",
          // PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
          // ZIPPOSTALCODE: validContact[0]?.postalCode || "",
          // CITY: validContact[0]?.city || "",
          CURRENT_DAY_FULL_DATE: new Date().toLocaleDateString(),
          CURRENT_DAY_NUMBER: new Date().getDate(),
          CURRENT_DAY_NAME: new Date().toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: new Date().getMonth() + 1,
          CURRENT_MONTH_NAME: new Date().toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: new Date().getFullYear(),
          LAST_DAY_FULL_DATE: lastDayFullDate,
          LAST_DAY_NUMBER: lastDayNumber,
          LAST_DAY_NAME: lastDayName,
          LAST_WEEK: lastWeek,
          LAST_MONTH_NUMBER: lastMonthNumber,
          LAST_MONTH_NAME: lastMonthName,
          LAST_QUARTER: lastQuarter,
          LAST_YEAR: lastYear,
          NEXT_DAY_FULL_DATE: nextDayFullDate,
          NEXT_DAY_NUMBER: nextDayNumber,
          NEXT_DAY_NAME: nextDayName,
          NEXT_WEEK: nextWeek,
          NEXT_MONTH_NUMBER: nextMonthNumber,
          NEXT_MONTH_NAME: nextMonthName,
          NEXT_QUARTER: nextQuarter,
          NEXT_YEAR: nextYear,
        };

        // Function to replace placeholders in text
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || "";
          });
        };

        // Replace placeholders in the organizer's template
        if (organizer.organizertemplateid) {
          organizer.organizertemplateid.organizerName = replacePlaceholders(
            organizer.organizertemplateid.organizerName || "",
            placeholderValues
          );
        }
        organizer.organizerName = replacePlaceholders(organizer.organizerName || "",placeholderValues)
      }
    };

    // Call the function to process organizer data
    await processOrganizerData(pendingOrganizers);

    res.status(200).json({
      message: "Pending organizers retrieved successfully",
      pendingOrganizers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
};

//update a new OrganizerTemplate
const updateOrganizer = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid TaskTemplate ID" });
  }

  try {
    const updatedOrganizerAccountWise =
      await OrganizerAccountWise.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true }
      );

    if (!updatedOrganizerAccountWise) {
      return res.status(404).json({ error: "No such OrganizerAccountWise" });
    }

    res
      .status(200)
      .json({
        message: "Organizer AccountWise Updated successfully",
        updatedOrganizerAccountWise,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
};

const updateOrganizerAccountWise = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid TaskTemplate ID" });
  }

  try {
    // Validate the request body structure
    //if (!req.body.sections || !Array.isArray(req.body.sections)) {
     // return res.status(400).json({ error: "Invalid sections data" });
    //}

    // Process file metadata updates
    const updateData = {
      ...req.body,
      lastSaved: new Date() // Always update the lastSaved timestamp
    };

    const updatedOrganizerAccountWise = await OrganizerAccountWise.findOneAndUpdate(
      { _id: id },
      updateData,
      { 
        new: true,
        runValidators: true // Ensure schema validations run
      }
    );

    if (!updatedOrganizerAccountWise) {
      return res.status(404).json({ error: "No such OrganizerAccountWise" });
    }

    res.status(200).json({
      message: "Organizer AccountWise Updated successfully",
      updatedOrganizerAccountWise,
    });
  } catch (error) {
    console.error("Error updating organizer:", error);
    return res.status(500).json({ 
      error: error.message,
      details: "Failed to update organizer with file information" 
    });
  }
};
const transporter = require("../middleware/nodemailer.js");
const User = require("../models/userModel.js")
// const updateOrganizerAndNotify = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid OrganizerAccountWise ID" });
//   }

//   try {
//     // Update organizer fields
//     await OrganizerAccountWise.findByIdAndUpdate(id, { ...req.body });

//     // Re-fetch with populated client and account info
//     const updatedOrganizerAccountWise = await OrganizerAccountWise.findById(id)
//       // .populate("organizer.completedby")
//       .populate({ path: "completedby", model: "User" })
//       .populate({
//         path: "accountid",
//         model: "Accounts",
//         populate: {
//           path: "adminUserId",
//           model: "User",
//           select: "emailSyncEmail email username"
//         }
//       })
//       .lean();
//       // .populate({ path: "accountid", model: "Accounts" }); // Assuming you have a ref to Account

//     if (!updatedOrganizerAccountWise) {
//       return res.status(404).json({ error: "No such OrganizerAccountWise" });
//     }
// console.log("updatedOrganizerAccountWise",updatedOrganizerAccountWise)
//     const completedByUsername =
//       updatedOrganizerAccountWise.completedby?.username || "Unknown User";
//     const accountName =
//       updatedOrganizerAccountWise.accountid?.accountName || "Unknown Account";
// const adminEmailSync = updatedOrganizerAccountWise.accountid?.adminUserId?.emailSyncEmail
//     // ? Send email to admin
//     await transporter.sendMail({
//       from: `<${process.env.EMAIL}>`,
//       to: adminEmailSync,
//       subject: `#Organizer completed by ${completedByUsername}`,
//       html: `
//         <p><strong>Account:</strong> ${accountName}</p>
//         <p><strong>Completed by:</strong> ${completedByUsername}</p>
//         <p><strong>Status:</strong> Organizer marked as completed</p>
//       `,
//     });

//     res.status(200).json({
//       message: "Organizer updated and admin notified",
//       completedByUsername,
//       accountName,
//       updatedOrganizerAccountWise,
//     });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
const updateOrganizerAndNotify = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid OrganizerAccountWise ID" });
  }

  try {
    // Update organizer fields
    await OrganizerAccountWise.findByIdAndUpdate(id, { ...req.body });

    // Re-fetch with populated client and account info
    const updatedOrganizerAccountWise = await OrganizerAccountWise.findById(id)
      //.populate({ path: "completedby", model: "User" })
      .populate({
        path: "accountid",
        model: "clientAccount",
        populate: {
          path: "adminUserId",
          model: "User",
          select: "emailSyncEmail email username"
        }
      })
      .lean();

    if (!updatedOrganizerAccountWise) {
      return res.status(404).json({ error: "No such OrganizerAccountWise" });
    }

    const completedByUsername =
      updatedOrganizerAccountWise.completedby || "Unknown User";
    const accountName =
      updatedOrganizerAccountWise.accountid?.accountName || "Unknown Account";
    const adminEmailSync =
      updatedOrganizerAccountWise.accountid?.adminUserId?.emailSyncEmail;

    // ? Only send email if adminEmailSync exists
    if (adminEmailSync) {
      await transporter.sendMail({
        from: `<${process.env.EMAIL}>`,
        to: adminEmailSync,
        subject: `#Organizer completed by ${accountName}`,
        html: `
          <p><strong>Account:</strong> ${accountName}</p>
          <p><strong>Completed by:</strong> ${completedByUsername}</p>
          <p><strong>Status:</strong> Organizer marked as completed</p>
        `,
      });
    }

    res.status(200).json({
      message: adminEmailSync
        ? "Organizer updated and admin notified"
        : "Organizer updated (no admin email found)",
      completedByUsername,
      accountName,
      updatedOrganizerAccountWise,
    });
  } catch (error) {
    console.error("Error updating organizer:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateOrganizerAccountWiseStatus = async (req, res) => {
  const { id, issubmited } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid OrganizerAccountWise ID" });
  }

  try {
    // Ensure issubmited is properly handled and included in the update
    const updatedData = {
      ...req.body,
      issubmited: issubmited === "true", // Assuming issubmited is passed as a string ("true"/"false")
    };

    const updatedOrganizerAccountWise = await OrganizerAccountWise.findOneAndUpdate(
      { _id: id },
      updatedData,
      { new: true }
    );

    if (!updatedOrganizerAccountWise) {
      return res.status(404).json({ error: "No such OrganizerAccountWise" });
    }

    res.status(200).json({ message: "Organizer AccountWise updated successfully", updatedOrganizerAccountWise });
  } catch (error) {
    return res.status(500).json({ error: error.message})}
};


const updateFormElementActiveStatus = async (req, res) => {
  const { organizerId, sectionId, formElementId } = req.params;
  const { active } = req.body;

  try {
    const organizer = await OrganizerAccountWise.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const section = organizer.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const formElement = section.formElements.find((fe) => fe.id === parseInt(formElementId));
    if (!formElement) {
      return res.status(404).json({ message: 'Form Element not found' });
    }

    formElement.active = active;
    await organizer.save();

    return res.status(200).json({
      message: 'Form Element active status updated',
      formElement,
    });
  } catch (error) {
    console.error('Error updating formElement active status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// const autoSaveOrganizer = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;

//         // Validate ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid organizer ID" });
//         }

//         // Add lastSaved timestamp
//         // updateData.lastSaved = new Date();

//         const updatedOrganizer = await OrganizerAccountWise.findByIdAndUpdate(
//             id,
//             { $set: updateData },
//             { new: true, runValidators: true }
//         );

//         if (!updatedOrganizer) {
//             return res.status(404).json({ message: "Organizer not found" });
//         }

//         res.status(200).json({
//             message: "Organizer auto-saved successfully",
//             organizer: updatedOrganizer
//         });
//     } catch (error) {
//         console.error("Error auto-saving organizer:", error);
//         res.status(500).json({ 
//             message: "Server error during auto-save",
//             error: error.message 
//         });
//     }
// };

const autoSaveOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
        const { sections } = req.body; // Expect sections array with formElement updates

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organizer ID" });
        }

        // Build the update object dynamically
        const updateOperations = {};
        
        sections.forEach((section, sectionIndex) => {
            if (section.formElements && section.formElements.length > 0) {
                section.formElements.forEach((element, elementIndex) => {
                    const basePath = `sections.${sectionIndex}.formElements.${elementIndex}`;
                    
                    // Only update answer-related fields
                    if (element.textvalue !== undefined) {
                        updateOperations[`${basePath}.textvalue`] = element.textvalue;
                    }
                    if (element.options !== undefined) {
                        updateOperations[`${basePath}.options`] = element.options;
                    }
                    if (element.fileMetadata !== undefined) {
                        updateOperations[`${basePath}.fileMetadata`] = element.fileMetadata;
                    }
                });
            }
        });

        // Add lastSaved timestamp if needed
        updateOperations.lastSaved = new Date();

        const updatedOrganizer = await OrganizerAccountWise.findByIdAndUpdate(
            id,
            { $set: updateOperations },
            { new: true, runValidators: true }
        );

        if (!updatedOrganizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }

        res.status(200).json({
            message: "Form answers auto-saved successfully",
            organizer: updatedOrganizer
        });
    } catch (error) {
        console.error("Error auto-saving organizer:", error);
        res.status(500).json({ 
            message: "Server error during auto-save",
            error: error.message 
        });
    }
};
const renameOrganizerAccountWise = async (req, res) => {
  const { id } = req.params;
  const { organizerName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Organizer ID" });
  }

  if (!organizerName || organizerName.trim() === "") {
    return res.status(400).json({ error: "Organizer name is required" });
  }

  try {
    const updatedOrganizer = await OrganizerAccountWise.findByIdAndUpdate(
      id,
      { organizerName, lastSaved: new Date() }, // Update lastSaved as well
      { new: true, runValidators: true }
    );

    if (!updatedOrganizer) {
      return res.status(404).json({ error: "Organizer not found" });
    }

    res.status(200).json({
      message: "Organizer renamed successfully",
      updatedOrganizer,
    });
  } catch (error) {
    console.error("Error renaming organizer:", error);
    res.status(500).json({ error: "Failed to rename organizer" });
  }
};
module.exports = {
  createOrganizerAccountWise,
  getOrganizerAccountWise,
  getOrganizerAccountWises,
  deleteOrganizerAccountWise,
  getOrganizerByAccountId,
  updateOrganizerAccountWise,
  updateOrganizerAccountWiseStatus,
  getActiveOrganizerByAccountId,getPendingOrganizersByAccountId,
  updateFormElementActiveStatus,
  updateOrganizerAndNotify,autoSaveOrganizer,updateOrganizer,renameOrganizerAccountWise,updateOrganizer 
};
