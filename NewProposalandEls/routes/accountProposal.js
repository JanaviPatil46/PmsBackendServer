import express from 'express';
import StepperForm from '../models/AccountStepperForm.js';
import ProposalTemplate from "../models/StepperForm.js"
import "../models/AccountModel.js";
import Accounts from "../models/AccountModel.js";
import Contacts from "../models/ContactModel.js";
import mongoose from "mongoose";
import "../models/userModel.js"; // ensure User model is registered
import nodemailer from "nodemailer";
import transporter  from "../middleware/nodemailer.js";
const router = express.Router();
// Reusable mail transporter (Gmail Example)
const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});
// Create new proposal
//router.post('/', async (req, res) => {
  //try {
   // const proposalData = {
      //general: req.body.general || {},
     // introduction: req.body.introduction || {},
    //  terms: req.body.terms || {},
   //   services: req.body.services || { option: "", invoices: [], itemizedData: {} },
     // payments: req.body.payments || {},
//status:req.body.status || "Pending",
  //  };

    //const proposal = new StepperForm(proposalData);
    //await proposal.save();
   // res.status(201).json(proposal);
  //} catch (error) {
   // res.status(400).json({ error: error.message });
 // }
//});
// Create new proposal + Send email
//router.post("/", async (req, res) => {
 // try {
   // const proposalData = {
   //   general: req.body.general || {},
   //   introduction: req.body.introduction || {},
   //   terms: req.body.terms || {},
   //   services: req.body.services || { option: "", invoices: [], itemizedData: {} },
    //  payments: req.body.payments || {},
   //   status: req.body.status || "Pending",
  //  };

  //  const proposal = new StepperForm(proposalData);
  //  await proposal.save();

  //  const accountIds = proposal.general?.account || [];

     //?? FIX ADDED HERE
   // const missingAccounts = [];

   // if (Array.isArray(accountIds) && accountIds.length > 0) {
   //   for (const accountId of accountIds) {
     //   const account = await Accounts.findById(accountId).lean();
     //   if (!account) continue;

      //  let delivered = false;

       // for (const accContact of account.contacts) {
        //  if (!accContact.canLogin) continue;

         // const contact = await Contacts.findById(accContact.contact).lean();
       //   if (!contact || !contact.email) continue;

        //  const proposalLink = `https://www.snptaxes.com/client/proposal/${proposal._id}`;
        //  const proposalName = proposal.general?.proposalName || "Proposal Document";

          //await transporter.sendMail({
           // from: process.env.EMAIL,
          //  to: contact.email,
           // subject: `Review & Sign Document: ${proposalName}`,
          //  html: `
           //   <p><b>${proposalName}</b></p>
            // <p>You have a new proposal to review and sign.</p>

            //  <a href="${proposalLink}" 
             //  style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
             //   Review & Sign
             // </a>

           // <p>If the button does not work, open this link:</p>
           //   <p><a href="${proposalLink}">${proposalLink}</a></p>
           // `,
         // });

       //   console.log(`?? Proposal email sent to ${contact.email}`);
         // delivered = true;
       //}

        // ?? If no contact got the email ? mark account
       // if (!delivered) missingAccounts.push(account.accountName);
     // }

      // ?? Notify admin if any accounts had no valid contact emails
     // if (missingAccounts.length > 0) {
       // await transporter.sendMail({
       //   from: process.env.EMAIL,
        //  to: process.env.EMAIL,
        //  subject: "? Proposal not delivered - No valid contacts",
        //  html: `
         //   <p>The following accounts have no contacts with login + email:</p>
          //  <p><b>${missingAccounts.join(", ")}</b></p>
           // <p>Proposal: ${proposal.general?.proposalName}</p>
         // `,
       // });

       // console.log("? Admin notified about missing contact emails");
     // }
   // }

    // res.status(201).json({
     // message: "Proposal created successfully and emails processed.",
     // proposal,
 //  });

  // } catch (error) {
  // console.error("? Error creating proposal:", error);
 //   res.status(400).json({ error: error.message });
 // }
//});
router.post("/", async (req, res) => {
  try {
    const proposalData = {
      general: req.body.general || {},
      introduction: req.body.introduction || {},
      terms: req.body.terms || {},
      services: req.body.services || { option: "", invoices: [], itemizedData: {} },
      payments: req.body.payments || {},
      status: req.body.status || "Pending",
    };

    const proposal = new StepperForm(proposalData);
    await proposal.save();

    const accountIds = proposal.general?.account || [];

    // Date calculations (same as in your first function)
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(lastDay.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const currentFullDate = currentDate.toLocaleDateString("en-US");
    const currentDayNumber = currentDate.getDate();
    const currentDayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
    const currentMonthNumber = currentDate.getMonth() + 1;
    const currentMonthName = currentDate.toLocaleDateString("en-US", { month: "long" });
    const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);
    const currentYear = currentDate.getFullYear();

    const lastDayFullDate = lastDay.toLocaleDateString("en-US");
    const lastDayNumber = lastDay.getDate();
    const lastDayName = lastDay.toLocaleDateString("en-US", { weekday: "long" });
    const lastMonthNumber = lastDay.getMonth() + 1;
    const lastMonthName = lastDay.toLocaleDateString("en-US", { month: "long" });
    const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3);
    const lastYear = lastDay.getFullYear();

    const nextDayFullDate = nextDay.toLocaleDateString("en-US");
    const nextDayNumber = nextDay.getDate();
    const nextDayName = nextDay.toLocaleDateString("en-US", { weekday: "long" });
    const nextMonthNumber = nextDay.getMonth() + 1;
    const nextMonthName = nextDay.toLocaleDateString("en-US", { month: "long" });
    const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3);
    const nextYear = nextDay.getFullYear();

    // Replace placeholders function (exactly as in your first code)
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    //?? FIX ADDED HERE
    const missingAccounts = [];

    if (Array.isArray(accountIds) && accountIds.length > 0) {
      for (const accountId of accountIds) {
        const account = await Accounts.findById(accountId).lean();
        if (!account) continue;

        let delivered = false;

        for (const accContact of account.contacts) {
          if (!accContact.canLogin) continue;

          const contact = await Contacts.findById(accContact.contact).lean();
          if (!contact || !contact.email) continue;

          const proposalLink = `https://snptaxes.com/client/client/login`;
          
          // Use replacePlaceholders for proposal name
          const proposalName = replacePlaceholders(proposal.general?.proposalName || "Proposal Document", {
            ACCOUNT_NAME: account.accountName,
            CURRENT_DAY_FULL_DATE: currentFullDate,
            CURRENT_DAY_NUMBER: currentDayNumber,
            CURRENT_DAY_NAME: currentDayName,
            CURRENT_MONTH_NUMBER: currentMonthNumber,
            CURRENT_MONTH_NAME: currentMonthName,
            CURRENT_QUARTER: currentQuarter,
            CURRENT_YEAR: currentYear,
            LAST_DAY_FULL_DATE: lastDayFullDate,
            LAST_DAY_NUMBER: lastDayNumber,
            LAST_DAY_NAME: lastDayName,
            LAST_MONTH_NUMBER: lastMonthNumber,
            LAST_MONTH_NAME: lastMonthName,
            LAST_QUARTER: lastQuarter,
            LAST_YEAR: lastYear,
            NEXT_DAY_FULL_DATE: nextDayFullDate,
            NEXT_DAY_NUMBER: nextDayNumber,
            NEXT_DAY_NAME: nextDayName,
            NEXT_MONTH_NUMBER: nextMonthNumber,
            NEXT_MONTH_NAME: nextMonthName,
            NEXT_QUARTER: nextQuarter,
            NEXT_YEAR: nextYear,
          });

          await transporter.sendMail({
            from: process.env.EMAIL,
            to: contact.email,
            subject: `Review & Sign Document: ${proposalName}`,
            html: `
              <p><b>${proposalName}</b></p>
             <p>You have a new proposal to review and sign.</p>

              <a href="${proposalLink}" 
               style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
                Review & Sign
              </a>

                       `,
          });

          console.log(`?? Proposal email sent to ${contact.email}`);
          delivered = true;
       }

        // ?? If no contact got the email ? mark account
        if (!delivered) missingAccounts.push(account.accountName);
      }

      // ?? Notify admin if any accounts had no valid contact emails
      if (missingAccounts.length > 0) {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: process.env.EMAIL,
          subject: "? Proposal not delivered - No valid contacts",
          html: `
            <p>The following accounts have no contacts with login + email:</p>
            <p><b>${missingAccounts.join(", ")}</b></p>
            <p>Proposal: ${proposal.general?.proposalName}</p>
          `,
        });

        console.log("? Admin notified about missing contact emails");
      }
    }

    res.status(201).json({
      message: "Proposal created successfully and emails processed.",
      proposal,
   });

  } catch (error) {
   console.error("? Error creating proposal:", error);
    res.status(400).json({ error: error.message });
  }
});
// Get all proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await StepperForm.find().sort({ createdAt: -1 });
res.json({ proposallist: proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get proposals by status = "Pending"
router.get('/status/pending', async (req, res) => {
  try {
    const proposals = await StepperForm.find({ status: "Pending" }).sort({ createdAt: -1 });
    res.json({ proposallist: proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get proposals by account ID and status = "Pending"
//router.get('/byaccount/:accountId/status/pending', async (req, res) => {
  //try {
   // const { accountId } = req.params;

   // const proposals = await StepperForm.find({
     // "general.account": accountId,  // account reference inside general object
     // status: "Pending"
   // })
    //  .populate("general.account", "accountName _id") // optional: populate account details
    //  .sort({ createdAt: -1 });

   // res.json({ proposallist: proposals });
 // } catch (error) {
  //  res.status(500).json({ error: error.message });
 // }
//});
// Get proposals by account ID and status = "Pending"
router.get('/byaccount/:accountId/status/pending', async (req, res) => {
  try {
    const { accountId } = req.params;

    let proposals = await StepperForm.find({
      "general.account": accountId,
      status: "Pending",
    })
      .populate("general.account", "accountName _id")
      .sort({ createdAt: -1 });

    // -----------------------
    // DATE VALUES
    // -----------------------
    const currentDate = new Date();

    const lastDay = new Date(currentDate);
    lastDay.setDate(currentDate.getDate() - 1);

    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setMonth(currentDate.getMonth() - 1);

    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(currentDate.getMonth() + 1);

    const lastQuarter = Math.floor((currentDate.getMonth() + 3) / 3) - 1;
    const nextQuarter = Math.floor((currentDate.getMonth() + 3) / 3) + 1;

    // -----------------------
    // REPLACE PLACEHOLDERS FUNCTION
    // -----------------------
    const replacePlaceholders = (template, data) => {
      return template?.replace(/\[([\w\s]+)\]/g, (match, key) => {
        key = key.trim();
        return data[key] ?? "";
      });
    };

    // -----------------------
    // PROCESS PROPOSALS
    // -----------------------
    for (const proposal of proposals) {
      const acc = proposal.general.account?.[0]; // account array in schema
      if (!acc) continue;

      const account = await Accounts.findById(acc._id).populate("contacts");
      if (!account) continue;

      const placeholderValues = {
        ACCOUNT_NAME: account.accountName || "",

        CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
        CURRENT_DAY_NUMBER: currentDate.getDate(),
        CURRENT_DAY_NAME: currentDate.toLocaleString("default", { weekday: "long" }),
        CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
        CURRENT_MONTH_NAME: currentDate.toLocaleString("default", { month: "long" }),
        CURRENT_YEAR: currentDate.getFullYear(),

        LAST_DAY_FULL_DATE: lastDay.toLocaleDateString(),
        LAST_DAY_NUMBER: lastDay.getDate(),
        LAST_DAY_NAME: lastDay.toLocaleString("default", { weekday: "long" }),
        LAST_MONTH_NUMBER: lastMonthDate.getMonth() + 1,
        LAST_MONTH_NAME: lastMonthDate.toLocaleString("default", { month: "long" }),
        LAST_QUARTER: lastQuarter,
        LAST_YEAR: currentDate.getFullYear() - 1,

        NEXT_DAY_FULL_DATE: nextDay.toLocaleDateString(),
        NEXT_DAY_NUMBER: nextDay.getDate(),
        NEXT_DAY_NAME: nextDay.toLocaleString("default", { weekday: "long" }),
        NEXT_MONTH_NUMBER: nextMonthDate.getMonth() + 1,
        NEXT_MONTH_NAME: nextMonthDate.toLocaleString("default", { month: "long" }),
        NEXT_QUARTER: nextQuarter,
        NEXT_YEAR: currentDate.getFullYear() + 1,
      };

      // -----------------------
      // APPLY TO PROPOSAL FIELDS
      // -----------------------

      // ? proposalName (correct schema path)
      if (proposal.general?.proposalName) {
        proposal.general.proposalName = replacePlaceholders(
          proposal.general.proposalName,
          placeholderValues
        );
      }

      // ? Introduction
      if (proposal.introduction?.title) {
        proposal.introduction.title = replacePlaceholders(
          proposal.introduction.title,
          placeholderValues
        );
      }
      if (proposal.introduction?.description) {
        proposal.introduction.description = replacePlaceholders(
          proposal.introduction.description,
          placeholderValues
        );
      }

      // ? Terms
      if (proposal.terms?.title) {
        proposal.terms.title = replacePlaceholders(
          proposal.terms.title,
          placeholderValues
        );
      }
      if (proposal.terms?.description) {
        proposal.terms.description = replacePlaceholders(
          proposal.terms.description,
          placeholderValues
        );
      }
    }

    res.json({ proposallist: proposals });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single proposal
router.get('/:id', async (req, res) => {
  try {
    const proposal = await StepperForm.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update proposal by ID
router.put('/:id', async (req, res) => {
  try {
    const proposal = await StepperForm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete proposal
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await StepperForm.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get proposals by account ID
//router.get('/byaccount/:accountId', async (req, res) => {
 // try {
    //const { accountId } = req.params;

   // const proposals = await StepperForm.find({
    //  "general.account": accountId,
    //  active: true   // optional: only active
   // }).sort({ createdAt: -1 });

    //if (!proposals || proposals.length === 0) {
   //   return res.status(404).json({ message: "No proposals found for this account" });
  //  }

  //  res.json({ proposallist: proposals });
  //} catch (error) {
  //  res.status(500).json({ error: error.message });
  //}
//});
// Get proposals by multiple account IDs
//router.get('/byaccount/:accountIds', async (req, res) => {
 // try {
    // accountIds could be comma-separated, e.g. "id1,id2,id3"
   // const accountIds = req.params.accountIds.split(',');

   // const proposals = await StepperForm.find({
    //  "general.account": { $in: accountIds },
    //  active: true  // optional filter
   // }).populate({
      //  path: "general.account",
       // select: "_id accountName", // only include these fields
     // }).sort({ createdAt: -1 });

   // if (!proposals || proposals.length === 0) {
   //   return res.status(404).json({ message: "No proposals found for these accounts" });
  //  }

   // res.json({ proposallist: proposals });
  // } catch (error) {
   // res.status(500).json({ error: error.message });
 // }
// });
router.get('/byaccount/:accountIds', async (req, res) => {
  try {
    // accountIds could be comma-separated, e.g. "id1,id2,id3"
    const accountIds = req.params.accountIds.split(',');

    const proposals = await StepperForm.find({
      "general.account": { $in: accountIds },
      active: true  // optional filter
    }).populate({
        path: "general.account",
        select: "_id accountName", // only include these fields
      }).sort({ createdAt: -1 });

    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: "No proposals found for these accounts" });
    }

    // Date calculations (same as in your first function)
    const currentDate = new Date();
    const lastDay = new Date(currentDate);
    lastDay.setDate(lastDay.getDate() - 1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const currentFullDate = currentDate.toLocaleDateString("en-US");
    const currentDayNumber = currentDate.getDate();
    const currentDayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
    const currentMonthNumber = currentDate.getMonth() + 1;
    const currentMonthName = currentDate.toLocaleDateString("en-US", { month: "long" });
    const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);
    const currentYear = currentDate.getFullYear();

    const lastDayFullDate = lastDay.toLocaleDateString("en-US");
    const lastDayNumber = lastDay.getDate();
    const lastDayName = lastDay.toLocaleDateString("en-US", { weekday: "long" });
    const lastMonthNumber = lastDay.getMonth() + 1;
    const lastMonthName = lastDay.toLocaleDateString("en-US", { month: "long" });
    const lastQuarter = Math.floor((lastDay.getMonth() + 3) / 3);
    const lastYear = lastDay.getFullYear();

    const nextDayFullDate = nextDay.toLocaleDateString("en-US");
    const nextDayNumber = nextDay.getDate();
    const nextDayName = nextDay.toLocaleDateString("en-US", { weekday: "long" });
    const nextMonthNumber = nextDay.getMonth() + 1;
    const nextMonthName = nextDay.toLocaleDateString("en-US", { month: "long" });
    const nextQuarter = Math.floor((nextDay.getMonth() + 3) / 3);
    const nextYear = nextDay.getFullYear();

    // Replace placeholders function (exactly as in your first code)
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    // Process proposals to replace placeholders in proposal names
    const processedProposals = proposals.map(proposal => {
      const proposalObj = proposal.toObject();
      const originalProposalName = proposalObj.general?.proposalName || "Proposal Document";
      
      // Get account name - handle both single account and array of accounts
      let accountName = "";
      if (proposalObj.general?.account) {
        if (Array.isArray(proposalObj.general.account)) {
          // If it's an array of accounts, use the first one
          accountName = proposalObj.general.account[0]?.accountName || "";
        } else {
          // If it's a single account object
          accountName = proposalObj.general.account?.accountName || "";
        }
      }

      console.log("Original proposal name:", originalProposalName);
      console.log("Account name:", accountName);

      // Use replacePlaceholders for proposal name
      const processedProposalName = replacePlaceholders(originalProposalName, {
        ACCOUNT_NAME: accountName,
        CURRENT_DAY_FULL_DATE: currentFullDate,
        CURRENT_DAY_NUMBER: currentDayNumber,
        CURRENT_DAY_NAME: currentDayName,
        CURRENT_MONTH_NUMBER: currentMonthNumber,
        CURRENT_MONTH_NAME: currentMonthName,
        CURRENT_QUARTER: currentQuarter,
        CURRENT_YEAR: currentYear,
        LAST_DAY_FULL_DATE: lastDayFullDate,
        LAST_DAY_NUMBER: lastDayNumber,
        LAST_DAY_NAME: lastDayName,
        LAST_MONTH_NUMBER: lastMonthNumber,
        LAST_MONTH_NAME: lastMonthName,
        LAST_QUARTER: lastQuarter,
        LAST_YEAR: lastYear,
        NEXT_DAY_FULL_DATE: nextDayFullDate,
        NEXT_DAY_NUMBER: nextDayNumber,
        NEXT_DAY_NAME: nextDayName,
        NEXT_MONTH_NUMBER: nextMonthNumber,
        NEXT_MONTH_NAME: nextMonthName,
        NEXT_QUARTER: nextQuarter,
        NEXT_YEAR: nextYear,
      });

      console.log("Processed proposal name:", processedProposalName);

      // Return the proposal with processed name while keeping all other fields
      return {
        ...proposalObj,
        general: {
          ...proposalObj.general,
          proposalName: processedProposalName
        }
      };
    });

    res.json({ proposallist: processedProposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Auto-create proposals for multiple accounts using template data
//router.post('/automation', async (req, res) => {
 // try {
   // const { proposalTemp, account } = req.body;

    //if (!proposalTemp || !Array.isArray(account) || account.length === 0) {
      //return res.status(400).json({
       // error: "proposalTemp and account array are required"
     // });
   // }

    // Find template proposal
    //const template = await ProposalTemplate.findById(proposalTemp);
    //if (!template) {
      //return res.status(404).json({ error: "Template not found" });
    //}

    //let createdProposals = [];

    //for (const accId of account) {
      //const proposalData = {
        //general: {
          //skipStepper: template.general.skipStepper,
          //introductionEnabled: template.general.introductionEnabled,
          //termsEnabled: template.general.termsEnabled,
          //servicesEnabled: template.general.servicesEnabled,
          //paymentsEnabled: template.general.paymentsEnabled,
          //proposalTemp: proposalTemp,
          //account: [accId],
          //proposalName: template.general.proposalName,
          //teamMembers: template.general.teamMembers || []
        //},

        //introduction: template.introduction,
        //terms: template.terms,
        //services: {
          //option: template.services?.option || "",
          //invoices: template.services?.invoices || [],
          //itemizedData: template.services?.itemizedData || {}
        //},
        //payments: template.payments || {},
        //status: "Pending",
        //active: true
      //};

      //const newProposal = new StepperForm(proposalData);
      //await newProposal.save();
      //createdProposals.push(newProposal);
    //}

    //res.status(201).json({
      //message: "Proposals created successfully using template",
      //proposals: createdProposals
    //});

  //} catch (error) {
    //res.status(500).json({ error: error.message });
  //}
//});
router.post('/automation', async (req, res) => {
  try {
    const { proposalTemp, account } = req.body;

    if (!proposalTemp || !Array.isArray(account) || account.length === 0) {
      return res.status(400).json({
        error: "proposalTemp and account array are required"
      });
    }

    // Find template proposal
    const template = await ProposalTemplate.findById(proposalTemp);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    let createdProposals = [];
    let missingAccounts = [];

    for (const accId of account) {
      // -----------------------------------
      // 1??  Create proposal from the template
      // -----------------------------------
      const proposalData = {
        general: {
          skipStepper: template.general.skipStepper,
          introductionEnabled: template.general.introductionEnabled,
          termsEnabled: template.general.termsEnabled,
          servicesEnabled: template.general.servicesEnabled,
          paymentsEnabled: template.general.paymentsEnabled,
          proposalTemp: proposalTemp,
          account: [accId],
          proposalName: template.general.proposalName,
          teamMembers: template.general.teamMembers || []
        },

        introduction: template.introduction,
        terms: template.terms,
        services: {
          option: template.services?.option || "",
          invoices: template.services?.invoices || [],
          itemizedData: template.services?.itemizedData || {}
        },
        payments: template.payments || {},
        status: "Pending",
        active: true
      };

      const newProposal = new StepperForm(proposalData);
      await newProposal.save();
      createdProposals.push(newProposal);

      // -----------------------------------
      // 2??  FIND ACCOUNT + CONTACTS
      // -----------------------------------
      const accDoc = await Accounts.findById(accId)
        .populate("contacts.contact")
        .lean();

      if (!accDoc) continue;

      const proposalLink = `https://www.snptaxes.com/client/proposal/${newProposal._id}`;
      const proposalName = proposalData.general.proposalName || "Proposal Document";

      let delivered = false;

      // -----------------------------------
      // 3??  Send email to all valid contacts
      // -----------------------------------
      for (const item of accDoc.contacts) {
        if (!item.canLogin) continue;
        if (!item.contact?.email) continue;

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: item.contact.email,
          subject: `Review & Sign Document: ${proposalName}`,
          html: `
            <p><b>${proposalName}</b></p>
            <p>You have a new proposal to review and sign.</p>

            <a href="${proposalLink}"
              style="padding:10px 20px;background:#007bff;color:white;
              text-decoration:none;border-radius:6px;font-weight:bold;">
              Review & Sign
            </a>

            <p>If the button does not work, open this link:</p>
            <p><a href="${proposalLink}">${proposalLink}</a></p>
          `
        });

        console.log(`?? Proposal email sent to ${item.contact.email}`);
        delivered = true;
      }

      // -----------------------------------
      // 4??  Track accounts with no valid contacts
      // -----------------------------------
      if (!delivered) {
        missingAccounts.push(accDoc.accountName);
      }
    }

    // -----------------------------------
    // 5?? Notify admin if any accounts had no emails
    // -----------------------------------
    if (missingAccounts.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "? Proposal not delivered - No valid contacts (Automation)",
        html: `
          <p>The following accounts have NO contacts with a login + email:</p>
          <p><b>${missingAccounts.join(", ")}</b></p>
          <p>Template Used: ${template.general?.proposalName}</p>
        `
      });

      console.log("? Admin notified about missing contacts during automation");
    }

    // -----------------------------------
    // 6?? Response
    // -----------------------------------
    res.status(201).json({
      message: "Automation run successful. Proposals created & emails processed.",
      proposals: createdProposals,
      missingAccounts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ? SIGN PROPOSAL CONTROLLER
router.post("/sign/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Proposal ID" });
  }

  try {
    const { signature, signedAt, signedBy } = req.body;

    // Update the proposal
    await StepperForm.findByIdAndUpdate(id, {
      $set: {
        signature,
        signedAt: new Date(signedAt),
        signedBy,
        status: "Signed",
      },
    });

    // Fetch updated proposal with relationships
    const updatedProposal = await StepperForm.findById(id)
      .populate({
        path: "signedBy",
        model: "clientAccount",
        select: "accountName",
      })
      .populate({
        path: "general.account",
        model: "clientAccount",
        populate: {
          path: "adminUserId",
          model: "User",
          select: "emailSyncEmail email username",
        },
      })
      .lean();
console.log("updatedProposal",updatedProposal)
    if (!updatedProposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // The account is stored as an array under general.account[]
    const account = Array.isArray(updatedProposal.general.account)
      ? updatedProposal.general.account[0]
      : updatedProposal.general.account;

    const adminUser = account?.adminUserId;

    // Fallback from emailSyncEmail ? email
    const recipientEmail =
      adminUser?.emailSyncEmail?.trim() || adminUser?.email?.trim();

    if (!recipientEmail) {
      throw new Error("No valid email found for admin user");
    }

    // Compose notification email
    const mailOptions = {
      from: `"Proposal System" <${process.env.EMAIL}>`,
      to: recipientEmail,
      subject: `#Proposal Signed by ${
        account?.accountName || "Client"
      }`,
      html: `
        <h2>Proposal Signed</h2>
        <p><strong>Account:</strong> ${account?.accountName || "N/A"}</p>
                <p><strong>Proposal:</strong> ${
          updatedProposal.general?.proposalName || "Untitled"
        }</p>
        <p><strong>Signed at:</strong> ${new Date(
          updatedProposal.signedAt
        ).toLocaleString()}</p>
      `,
    };

    // Send email notification
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    res.status(200).json({
      message: "Proposal signed successfully & admin notified",
      emailSent: true,
      recipient: recipientEmail,
      proposalId: updatedProposal._id,
    });
  } catch (error) {
    console.error("Error in signProposal:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Failed to complete proposal signing",
      details: error.message,
      emailSent: false,
    });
  }
});

export default router;