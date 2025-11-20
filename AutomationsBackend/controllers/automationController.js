
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Account = require('../models/AccountModel.js');
const Contacts = require('../models/contactsModel.js');
const EmailTemplate = require('../models/emailTemplateModel.js')
const InvoiceTemplate = require('../models/invoiceTemplateModel.js')
const nodemailer = require("nodemailer");
exports.AutomationsMails = async (req, res) => {
  try {
    const { automationType, templateId, accountId } = req.body;

    // Log the incoming data for debugging
    console.log("Automation Type:", automationType);
    console.log("Template ID:", templateId);
    console.log("Account ID:", accountId);

    // Use a switch statement to handle different automation types
    switch (automationType) {
      case "Send Email":
        
      
      
      // Validate inputs
        if (!templateId || !accountId) {
          return res.status(400).json({ status: 400, message: "Please provide email template ID and account ID." });
        }

        // Fetch account and contacts
        const account = await Account.findById(accountId).populate("contacts.contact");
        if (!account) {
          return res.status(404).json({ status: 404, message: "Account not found." });
        }

        // Fetch the email template
        const emailTemplate = await EmailTemplate.findById(templateId);
        //console.log(emailTemplate)
        if (!emailTemplate) {

          return res.status(404).json({ status: 404, message: "Email template not found." });
        }

        // const { subject: emailsubject, body: emailbody } = emailTemplate;
        // Validate email template content
        // const { subject: emailsubject, body: emailbody } = emailTemplate;
        const { emailsubject, emailbody } = emailTemplate;
        //console.log(emailbody)
        if (!emailTemplate || !emailTemplate.emailsubject || !emailTemplate.emailbody) {
          return res.status(400).json({ status: 400, message: "Email template is missing subject or body." });
        }

        // Helper function to replace placeholders
        const replacePlaceholders = (template, data) => {
          return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
            return data[placeholder.trim()] || ""; // Replace with data or empty string
          });
        };

        // Filter valid contacts
    const validContacts = account.contacts.filter(c => c.contact && c.contact.email);
// only contacts with email
        if (validContacts.length === 0) {
          return res.status(400).json({ status: 400, message: "No contacts with emailSync enabled." });
        }
console.log("validatecontacts",validContacts)
        // Email sending logic
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false // Only for development
          },
        });
        // Get the current date
        const currentDate = new Date();

        const lastDay = new Date(currentDate);
        lastDay.setDate(lastDay.getDate() - 1); // Subtract 1 day to get the last day

        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1); // Add 1 day to get the next day

        // Define options for formatting date
        const options = {
          weekday: 'long',          // Full name of the day of the week (e.g., "Monday")
          day: '2-digit',          // Two-digit day of the month (01 through 31)
          month: 'long',           // Full name of the month (e.g., "January")
          year: 'numeric',         // Four-digit year (e.g., 2022)
          week: 'numeric',         // ISO week of the year (1 through 53)
          monthNumber: '2-digit',  // Two-digit month number (01 through 12)
          quarter: 'numeric',      // Quarter of the year (1 through 4)
        };


        // Format the current date using options
        const currentFullDate = currentDate.toLocaleDateString('en-US', options);
        const currentDayNumber = currentDate.getDate();
        const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const currentWeek = currentDate.toLocaleDateString('en-US', { week: 'numeric' });
        const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
        const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // Calculate the quarter
        const currentYear = currentDate.getFullYear();

        // Format the last day using options
        const lastDayFullDate = lastDay.toLocaleDateString('en-US', options);
        const lastDayNumber = lastDay.getDate();
        const lastDayName = lastDay.toLocaleDateString('en-US', { weekday: 'long' });
        const lastWeek = lastDay.toLocaleDateString('en-US', { week: 'numeric' });
        const lastMonthNumber = lastDay.getMonth() + 1; // Months are zero-based, so add 1
        const lastMonthName = lastDay.toLocaleDateString('en-US', { month: 'long' });
        const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3); // Calculate the quarter
        const lastYear = lastDay.getFullYear();

        // Format the next day using options
        const nextDayFullDate = nextDay.toLocaleDateString('en-US', options);
        const nextDayNumber = nextDay.getDate();
        const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
        const nextWeek = nextDay.toLocaleDateString('en-US', { week: 'numeric' });
        const nextMonthNumber = nextDay.getMonth() + 1; // Months are zero-based, so add 1
        const nextMonthName = nextDay.toLocaleDateString('en-US', { month: 'long' });
        const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3); // Calculate the quarter
        const nextYear = nextDay.getFullYear();
       for (const c of validContacts) {
  const contact= c.contact; // shortcut to populated contact info

  if (!contact?.email) continue; // skip if no email
          try {
            // Generate email body and subject
            const mailBody = replacePlaceholders(emailbody, {
              ACCOUNT_NAME: account.accountName,

              FIRST_NAME: contact.firstName,
              MIDDLE_NAME: contact.middleName,
              LAST_NAME: contact.lastName,
              CONTACT_NAME: contact.contactName,
              COMPANY_NAME: contact.companyName,
              COUNTRY: contact.country?.name,
              STREET_ADDRESS: contact.streetAddress,
              STATEPROVINCE: contact.state,
              PHONE_NUMBER: contact.phoneNumbers?.[0].phone,
              ZIPPOSTALCODE: contact.postalCode,
              CITY: contact.city,

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

            const mailSubject = replacePlaceholders(emailsubject, {
              ACCOUNT_NAME: account.accountName,

              FIRST_NAME: contact.firstName,
              MIDDLE_NAME: contact.middleName,
              LAST_NAME: contact.lastName,
              CONTACT_NAME: contact.contactName,
              COMPANY_NAME: contact.companyName,
              COUNTRY: contact.country?.name,
              STREET_ADDRESS: contact.streetAddress,
              STATEPROVINCE: contact.state,
              PHONE_NUMBER: contact.phoneNumbers,
              ZIPPOSTALCODE: contact.postalCode,
              CITY: contact.city,

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

            const mailOptions = {
              from: process.env.EMAIL,
              to: contact.email,
              subject: mailSubject,
              html: mailBody,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${contact.email}`);
          } catch (error) {
            console.error(`Failed to send email to ${contact.email}:`, error.message);
          }
        }

        return res.status(200).json({ status: 200, message: "Emails sent successfully." });
      // break;

     
        case "Send Invoice":

         
          // Validate inputs
          if (!templateId || !accountId) {
              return res.status(400).json({ status: 400, message: "Please provide email template ID and account ID." });
          }

          // Fetch account and contacts
          const sendinvoicemailaccount = await Account.findById(accountId).populate("contacts");
          if (!sendinvoicemailaccount) {
              return res.status(404).json({ status: 404, message: "Account not found." });
          }

          // Fetch the email template
          const invoiceTemplate = await InvoiceTemplate.findById(templateId);
          console.log(invoiceTemplate)
          if (!invoiceTemplate) {
              return res.status(404).json({ status: 404, message: "Invoice template not found." });
          }

          // Filter valid contacts
          const invoiceTemplatevalidContacts = sendinvoicemailaccount.contacts.filter(contact => contact.emailSync);
          if (invoiceTemplatevalidContacts.length === 0) {
              return res.status(400).json({ status: 400, message: "No contacts with emailSync enabled." });
          }

          // Email sending logic
          const invoiceTemplatetransporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: process.env.EMAIL,
                  pass: process.env.EMAIL_PASSWORD,
              },
              tls: {
                  rejectUnauthorized: false // Only for development
              },
          });

          for (const contact of invoiceTemplatevalidContacts) {
              try {
                  const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: contact.email,
                      subject: "Invoice Created",
                      html: `Invoice Created Successfully for Client ${sendinvoicemailaccount.accountName} `,
                  };

                  await invoiceTemplatetransporter.sendMail(mailOptions);
                  console.log(`Email sent to ${contact.email}`);
              } catch (error) {
                  console.error(`Failed to send email to ${contact.email}:`, error.message);
              }
          }

          return res.status(200).json({ status: 200, message: "Emails sent successfully." });
          // Add invoice logic here
          

      case "Send Proposal/Els":
     
        console.log("Executing proposal or El logic...");
        // Add proposal/El logic here
        break;

      case "Create Organizer":
        console.log("Executing organizer creation logic...");
        // Add organizer creation logic here
        break;

        case "Update account tags":
        console.log("Executing update account tags  logic...");
        // Add organizer creation logic here
        break;
        

        case "Create Task":
          console.log("Executing  Create Task  logic...");
          // Add organizer creation logic here
          break;

          case "Send message":
            console.log("Executing  Create Task  logic...");
            // Add organizer creation logic here
            break;
      default:
        console.log("Unknown automation type.");
        return res.status(400).json({ message: "Invalid automation type" });
    }

    // Send a success response for demonstration
    res.status(200).json({ message: `Automation '${automationType}' executed successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

