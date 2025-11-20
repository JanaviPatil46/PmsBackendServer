const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Account = require("../models/AccountModel.js");
const Contact = require("../models/contactsModel.js");
const moment = require("moment");
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
router.post("/sendBulkEmails", async (req, res) => {
  const { selectedAccounts, emailtemplateid, notificationemail, emailsubject, emailbody } = req.body;
  if (!emailtemplateid || !selectedAccounts) {
    return res.status(400).json({ status: 400, message: "Please provide all data." });
  }

  // Get the current date
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
  const currentDayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const currentWeek = currentDate.toLocaleDateString("en-US", { week: "numeric" });
  const currentMonthNumber = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentMonthName = currentDate.toLocaleDateString("en-US", { month: "long" });
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

  try {
    let totalEmails = 0;
    let emailsSent = 0;
    let missingContacts = [];

    for (const accountId of selectedAccounts) {
      const account = await Account.findById(accountId);
      const contacts = account.contacts;

      totalEmails = selectedAccounts.length;

      for (const contactId of contacts) {
        const contact = await Contact.findById(contactId);

        if (!contact) {
          console.log(`Contact not found: ${contactId}`);
          missingContacts.push(account.accountName); // Store missing contact ID
          continue; // Skip to the next contact if not found
        }

        if (contact.emailSync === true) {
          // Function to replace placeholders with actual data
          const replacePlaceholders = (template, data) => {
            return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
              return data[placeholder.trim()] || "";
            });
          };

          // Replace placeholders in the email body
          const mailBody = replacePlaceholders(emailbody, {
            ACCOUNT_NAME: account.accountName,
            FIRST_NAME: contact.firstName,
            MIDDLE_NAME: contact.middleName,
            LAST_NAME: contact.lastName,
            CONTACT_NAME: contact.contactName,
            COMPANY_NAME: contact.companyName,
            COUNTRY: contact.country,
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

          // Replace placeholders in the emailsubject
          const mailSubject = replacePlaceholders(emailsubject, {
            ACCOUNT_NAME: account.accountName,
            FIRST_NAME: contact.firstName,
            MIDDLE_NAME: contact.middleName,
            LAST_NAME: contact.lastName,
            CONTACT_NAME: contact.contactName,
            COMPANY_NAME: contact.companyName,
            COUNTRY: contact.country,
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

          const htmlPage = `
                        <!doctype html>
                        <html lang="en">
                        <style>
                            p {
                                color: #0f172a;
                                font-size: 18px;
                                line-height: 29px;
                                font-weight: 400;
                                margin: 8px 0 16px;
                            }
                            h1 {
                                color: #5566e5;
                                font-weight: 700;
                                font-size: 40px;
                                line-height: 44px;
                                margin-bottom: 4px;
                            }
                            h2 {
                                color: #1b235c;
                                font-size: 100px;
                                font-weight: 400;
                                line-height: 120px;
                                margin-top: 40px;
                                margin-bottom: 40px;
                            }
                            .container {
                                text-align: center;
                            }
                        </style>
                        <body>
                            <header>
                                <!-- place navbar here -->
                            </header>
                            <main>
                                <div class="container">
                                    <h1> Welcome to PMS </h1>
                                    ${mailBody}
                                    <h5>"Welcome to "SNP Tax & Financials", where tax management meets simplicity. Our advanced software
                                        streamlines tax processes for individuals, businesses, and professionals, ensuring accuracy and
                                        efficiency. Experience a new era of financial ease with SNP Tax & Financials."</h5>
                                </div>
                            </main>
                        </body>
                        </html>`;

          // Create transporter with Outlook service and authentication
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
              rejectUnauthorized: false
            },
          });

          const mailOptions = {
            from: process.env.EMAIL,
            to: contact.email,
            subject: mailSubject,
            html: htmlPage,
          };

          const sendMail = async () => {
            try {
              const info = await transporter.sendMail(mailOptions);
              console.log("Email sent:", info.response);
              emailsSent++;
              if (emailsSent === totalEmails) {
                // Send notification email after all bulk emails are sent
                const notificationMailOptions = {
                  from: process.env.EMAIL,
                  to: notificationemail,
                  subject: "Bulk Email Sending Complete",
                  text: "All bulk emails have been sent successfully.",
                  html: "All bulk emails have been sent successfully.",
                };
                await transporter.sendMail(notificationMailOptions);
                console.log("Email sent:", info.response);
              }
            } catch (error) {
              console.error("Error sending email:", error);
              throw error; // Throw error to trigger retry mechanism
            }
          };

          // Retry sending email up to 3 times
          let attempt = 1;
          while (attempt <= 3) {
            try {
              await sendMail();
              break; // Exit loop if email sent successfully
            } catch (error) {
              if (attempt === 3) {
                console.error("Max retry attempts reached. Unable to send email.");
                throw error; // Throw error if max attempts reached
              }
              console.log(`Retry attempt ${attempt}...`);
              attempt++;
            }
          }
        }
        else {
          console.log("ABCD")

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use TLS
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
              rejectUnauthorized: false
            },
          });

          try {
            const notificationMailOption = {
              from: process.env.EMAIL,
              to: notificationemail,
              subject: "Bulk Email Sending.",
              text: "Any of Contact not have EmailSync true.",
              html: "Any of Contact not have EmailSync true.",
            };

            const info = await transporter.sendMail(notificationMailOption);

            // Use info.response to log the result
            console.log("Email sent:", info.response);

          } catch (error) {
            console.error("Error sending email:", error);
            throw error; // Throw error to trigger retry mechanism
          };

        }
      }
    }

    // Create transporter with Outlook service and authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
    });
    console.log(missingContacts.length);
    // Check if there are missing contacts
    if (missingContacts.length > 0) {
      // Send notification email after all bulk emails are sent
      const notificationMailOptions = {
        from: process.env.EMAIL,
        to: notificationemail,
        subject: "Bulk Email Sending Complete with Exception.",
        text: `All bulk emails have been sent successfully.`,
        html: `<p>All bulk emails have been sent successfully, , Except ${missingContacts}</p>`,
      };

      await transporter.sendMail(notificationMailOptions);
    }
    res.status(200).json({ status: 200, message: "Bulk emails sent successfully." });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    res.status(500).json({ status: 500, error: "Internal server error." });
  }
});

module.exports = router;
