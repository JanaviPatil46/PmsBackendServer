require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const ProposalesandelsAccountwise = require("../models/proposalAccountwiseModel");
const mongoose = require("mongoose");
const Accounts = require("../models/AccountModel"); // Ensure the path is correct
const User = require("../models/userModel"); // Import User if not already imported
const ProposalanselsTemplate = require("../models/proposalsandelsModel"); // Import if used
const nodemailer = require("nodemailer");
const Contacts = require("../models/contactsModel");
const InvoiceTemplate = require("../models/invoiceTemplateModel")
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

//get all ProposalesAndElsTemplate
const getProposalesAndElsAccountswise = async (req, res) => {
  try {
    const proposalesandelsAccountwise = await ProposalesandelsAccountwise.find(
      {}
    ).sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        message: "ProposalesAndEls Accountwise retrieved successfully",
        proposalesandelsAccountwise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingProposalesAndElsAccountswise = async (req, res) => {
  try {
    const pendingProposalesandels = await ProposalesandelsAccountwise.find({
      status: "Pending",
    }).sort({ createdAt: -1 });


  // Function to process proposal data
    const processProposalData = async (pendingProposalesandels) => {
      for (const proposal of pendingProposalesandels) {
        console.log(proposal.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          proposal.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${proposal.accountid._id}`);
          continue;
        }

       
        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
                   CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: currentDate.getFullYear(),
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

        // Replace placeholders in the proposal title or content
        proposal.proposalname = replacePlaceholders(
          proposal.proposalname || "",
          placeholderValues
        );
        proposal.introductiontext = replacePlaceholders( proposal.introductiontext || "",
            placeholderValues
        );
        proposal.termsandconditions = replacePlaceholders(proposal.termsandconditions || "", placeholderValues)
      }
    };

    // Process proposal data
    await processProposalData(pendingProposalesandels);
    res.status(200).json({
      message: "Pending ProposalesAndEls Accountwise retrieved successfully",
      proposalesandelsAccountwise: pendingProposalesandels,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single ServiceTemplate
const getProposalesAndElsAccountwise = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ error: "Invalid ProposalesAndEls Accountwise ID" });
  }
  try {
    const proposalesandelsAccountwise =
      await ProposalesandelsAccountwise.findById(id);
    if (!proposalesandelsAccountwise) {
      return res
        .status(404)
        .json({ error: "No such ProposalesAndEls Accountwise" });
    }

    res
      .status(200)
      .json({
        message: "ProposalesAndEls Accountwise retrieved successfully",
        proposalesandelsAccountwise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//const getProposalandElsListbyAccountid = async (req, res) => {
  //const { id } = req.params; // Correct destructuring
 // try {
 //   const proposalesandelsAccountwise = await ProposalesandelsAccountwise.find({
  //    accountid: id,
  //  })
   //   .populate({ path: "accountid", model: "Accounts" }) // Ensure model name matches exactly
    //  .populate({ path: "proposaltemplateid", model: "ProposalesAndEls" })
     // .populate({ path: "teammember", model: "User" }); // Ensure model name matches exactly; // Corrected syntax here

   // const account = await Accounts.findById(id).populate("contacts");

  //  const validContact = account.contacts.filter(
   //   (contact) => contact.emailSync
   // );

  //  console.log(validContact[0]?.firstName);

  //  const placeholderValues = {
  //    ACCOUNT_NAME: account?.accountName || "",
  //    FIRST_NAME: validContact[0]?.firstName || "",
   //   MIDDLE_NAME: validContact[0]?.middleName || "",
   //   LAST_NAME: validContact[0]?.lastName || "",
   //   CONTACT_NAME: validContact[0]?.contactName || "",
    //  COMPANY_NAME: validContact[0]?.companyName || "",
    //  COUNTRY: validContact[0]?.country || "",
   //   STREET_ADDRESS: validContact[0]?.streetAddress || "",
   //   STATEPROVINCE: validContact[0]?.state || "",
   //   PHONE_NUMBER: validContact[0]?.phoneNumbers || "",
    //  ZIPPOSTALCODE: validContact[0]?.postalCode || "",
    //  CITY: validContact[0]?.city || "",
    //  CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
    //  CURRENT_DAY_NUMBER: currentDate.getDate(),
   //   CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
     //   weekday: "long",
   //  }),
    //  CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
   //   CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
      //  month: "long",
    //  }),
   //   CURRENT_YEAR: currentDate.getFullYear(),
    //  LAST_DAY_FULL_DATE: lastDayFullDate,
    //  LAST_DAY_NUMBER: lastDayNumber,
    //  LAST_DAY_NAME: lastDayName,
    //  LAST_WEEK: lastWeek,
    //  LAST_MONTH_NUMBER: lastMonthNumber,
    //  LAST_MONTH_NAME: lastMonthName,
   //   LAST_QUARTER: lastQuarter,
     // LAST_YEAR: lastYear,
    //  NEXT_DAY_FULL_DATE: nextDayFullDate,
   //   NEXT_DAY_NUMBER: nextDayNumber,
    //  NEXT_DAY_NAME: nextDayName,
    //  NEXT_WEEK: nextWeek,
    //  NEXT_MONTH_NUMBER: nextMonthNumber,
    //  NEXT_MONTH_NAME: nextMonthName,
   //   NEXT_QUARTER: nextQuarter,
    //  NEXT_YEAR: nextYear,
     // // Add other dynamic placeholders as required
   // };

    // Function to replace placeholders in text
  //  const replacePlaceholders = (template, data) => {
   //   return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
     //   return data[placeholder.trim()] || "";
     // });
   // };

    //const updatedProposals = proposalesandelsAccountwise.map((inv) => {
    //  const updatedproposalname = replacePlaceholders(
     //   inv.proposalname || "",
     //   placeholderValues
    //  );
    //  const updatedcustommessageinemailtext = replacePlaceholders(
    //    inv.custommessageinemailtext || "",
      //  placeholderValues
   //   );
     // const updatedintroductiontext = replacePlaceholders(
     //   inv.introductiontext || "",
      //  placeholderValues
    //  );
     // const updatedtermasandconditions = replacePlaceholders(
      //  inv.termsandconditions || "",
      //  placeholderValues
    //  );
    //  return {
     //   ...inv.toObject(),
     //   proposalname: updatedproposalname, // Replace description with the updated version
     //   custommessageinemailtext: updatedcustommessageinemailtext,
     //   // introductiontext: updatedintroductiontext,
     //   // termsandconditions: updatedtermasandconditions
     // };
   // });

   // if (
   //   !proposalesandelsAccountwise ||
    //  proposalesandelsAccountwise.length === 0
   // ) {
    //  return res
     //   .status(404)
     //   .json({ message: "No Proposalesandels found for this account." });
   // }
   // res.status(200).json({
    //  message: "Proposalesandels Accountwise retrieved successfully",
   // //  proposalesandelsAccountwise: updatedProposals,
  //  });
 // } catch (error) {
    //res.status(500).json({ error: error.message });
  //}
//};
const getProposalandElsListbyAccountid = async (req, res) => {
  const { id } = req.params; // May contain multiple IDs (comma-separated)

  try {
    const accountIdsArray = id.split(",");

    // Fetch proposals for all accounts
    const proposalesandelsAccountwise = await ProposalesandelsAccountwise.find({
      accountid: { $in: accountIdsArray },
    })
      .populate({ path: "accountid", model: "Accounts" })
      .populate({ path: "proposaltemplateid", model: "ProposalesAndEls" })
      .populate({ path: "teammember", model: "User" });

    if (!proposalesandelsAccountwise || proposalesandelsAccountwise.length === 0) {
      return res.status(404).json({ message: "No Proposalesandels found for these accounts." });
    }

    // Fetch accounts with contacts
    const accounts = await Accounts.find({ _id: { $in: accountIdsArray } }).populate("contacts");

    const currentDate = new Date();

    // Helper function: replace placeholders
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    // Process each proposal
    const updatedProposals = proposalesandelsAccountwise.map((inv) => {
      // Match correct account for this proposal
      const account = accounts.find(acc => acc._id.toString() === inv.accountid._id.toString());
     

      const placeholderValues = {
        ACCOUNT_NAME: account?.accountName || "",
                CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
        CURRENT_DAY_NUMBER: currentDate.getDate(),
        CURRENT_DAY_NAME: currentDate.toLocaleString("default", { weekday: "long" }),
        CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
        CURRENT_MONTH_NAME: currentDate.toLocaleString("default", { month: "long" }),
        CURRENT_YEAR: currentDate.getFullYear(),
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

        // TODO: add LAST_* and NEXT_* calculations (lastDayFullDate, nextWeek, etc.)
      };

      return {
        ...inv.toObject(),
        proposalname: replacePlaceholders(inv.proposalname || "", placeholderValues),
        custommessageinemailtext: replacePlaceholders(inv.custommessageinemailtext || "", placeholderValues),
        introductiontext: replacePlaceholders(inv.introductiontext || "", placeholderValues),
        termsandconditions: replacePlaceholders(inv.termsandconditions || "", placeholderValues),
      };
    });

    res.status(200).json({
      message: "Proposalesandels Accountwise retrieved successfully",
      proposalesandelsAccountwise: updatedProposals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProposalandElsList = async (req, res) => {
  try {
    const proposalesandelsAccountwise = await ProposalesandelsAccountwise.find()
      .populate({ path: "accountid", model: "Accounts" }) // Ensure model name matches exactly
      .populate({ path: "proposaltemplateid", model: "ProposalesAndEls" })
      .populate({ path: "teammember", model: "User" });

    // Function to process proposal data
    const processProposalData = async (proposalesandelsAccountwise) => {
      for (const proposal of proposalesandelsAccountwise) {
        console.log(proposal.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          proposal.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${proposal.accountid._id}`);
          continue;
        }

       
        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
                  CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: currentDate.getFullYear(),
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

        // Replace placeholders in the proposal title or content
        proposal.proposalname = replacePlaceholders(
          proposal.proposalname || "",
          placeholderValues
        );
      }
    };

    // Process proposal data
    await processProposalData(proposalesandelsAccountwise);

    res
      .status(200)
      .json({
        message: "Proposalesandels Accountwise retrieved successfully",
        proposalesandelsAccountwise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single InvoiceList List
// const getProposalandElsListbyid = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const proposalesandelsAccountwise =
//       await ProposalesandelsAccountwise.findById(id)
//         .populate({ path: "accountid", model: "Accounts" }) // Ensure model name matches exactly
//         .populate({
//           path: "proposaltemplateid",
//           model: "ProposalesAndEls",
//           select: "templatename _id",
//         })
//         .populate({ path: "teammember", model: "User" })
//         .populate({
//           path: "invoiceteammember",
//           model: "User",
//           select: "username _id",
//         })
//         .populate({
//           path: "servicesandinvoicetempid",
//           model: "InvoiceTemplate",
//           select: "templatename _id",
//         });

        
//     res
//       .status(200)
//       .json({
//         message: "Proposalesandels Accountwise retrieved successfully",
//         proposalesandelsAccountwise,
//       });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getProposalandElsListbyid = async (req, res) => {
  const { id } = req.params;

  try {
    const proposalesandelsAccountwise = await ProposalesandelsAccountwise.findById(id)
      .populate({ path: "accountid", model: "Accounts" })
      .populate({
        path: "proposaltemplateid",
        model: "ProposalesAndEls",
        select: "templatename _id",
      })
      .populate({ path: "teammember", model: "User" })
      .populate({
        path: "invoiceteammember",
        model: "User",
        select: "username _id",
      })
      .populate({
        path: "servicesandinvoicetempid",
        model: "InvoiceTemplate",
        select: "templatename _id",
      });

    if (!proposalesandelsAccountwise) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Get account details and populate contacts
    const account = await Accounts.findById(proposalesandelsAccountwise.accountid._id).populate("contacts");
    
    // Generate date-related placeholders
    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    const lastDate = new Date(currentDate);
    lastDate.setDate(currentDate.getDate() - 1);

    const placeholderValues = {
      ACCOUNT_NAME: account?.accountName || "",
           CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleString("default", { weekday: "long" }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleString("default", { month: "long" }),
      CURRENT_YEAR: currentDate.getFullYear(),
      LAST_DAY_FULL_DATE: lastDate.toLocaleDateString(),
      LAST_DAY_NUMBER: lastDate.getDate(),
      LAST_DAY_NAME: lastDate.toLocaleString("default", { weekday: "long" }),
      LAST_WEEK: getWeekNumber(new Date(currentDate.setDate(currentDate.getDate() - 7))),
      LAST_MONTH_NUMBER: lastDate.getMonth() + 1,
      LAST_MONTH_NAME: lastDate.toLocaleString("default", { month: "long" }),
      LAST_QUARTER: Math.ceil((lastDate.getMonth() + 1) / 3),
      LAST_YEAR: lastDate.getFullYear(),
      NEXT_DAY_FULL_DATE: nextDate.toLocaleDateString(),
      NEXT_DAY_NUMBER: nextDate.getDate(),
      NEXT_DAY_NAME: nextDate.toLocaleString("default", { weekday: "long" }),
      NEXT_WEEK: getWeekNumber(new Date(currentDate.setDate(currentDate.getDate() + 14))),
      NEXT_MONTH_NUMBER: nextDate.getMonth() + 1,
      NEXT_MONTH_NAME: nextDate.toLocaleString("default", { month: "long" }),
      NEXT_QUARTER: Math.ceil((nextDate.getMonth() + 1) / 3),
      NEXT_YEAR: nextDate.getFullYear(),
    };

    function getWeekNumber(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    // Replace placeholders in proposal name
    proposalesandelsAccountwise.proposalname = replacePlaceholders(
      proposalesandelsAccountwise.proposalname || "",
      placeholderValues
    );
proposalesandelsAccountwise.introductiontext = replacePlaceholders(
    proposalesandelsAccountwise.introductiontext || ""
,placeholderValues);
proposalesandelsAccountwise.termsandconditions = replacePlaceholders( proposalesandelsAccountwise.termsandconditions || "", placeholderValues);
    proposalesandelsAccountwise.custommessageinemailtext = replacePlaceholders(proposalesandelsAccountwise.custommessageinemailtext || "", placeholderValues)
res.status(200).json({
      message: "Proposalesandels Accountwise retrieved successfully",
      proposalesandelsAccountwise,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProposalesAndElsAccountwise = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ error: "Invalid ProposalesAndEls Accountwise ID" });
  }
  try {
    const deletedProposalesAndElsAccountwise =
      await ProposalesandelsAccountwise.findByIdAndDelete({ _id: id });
    if (!deletedProposalesAndElsAccountwise) {
      return res
        .status(404)
        .json({ error: "No such  ProposalesAndEls Accountwise" });
    }
    res
      .status(200)
      .json({
        message: " ProposalesAndEls Accountwise deleted successfully",
        deletedProposalesAndElsAccountwise,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a new ServiceTemplate
const updateProposalesandelsAccountwise = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ error: "Invalid Proposalesandels Accountwise ID" });
  }
  try {
    const updatedProposalesandelsAccountwise =
      await ProposalesandelsAccountwise.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true }
      );
    if (!updatedProposalesandelsAccountwise) {
      return res
        .status(404)
        .json({ error: "No such Proposalesandels Accountwise" });
    }
    res
      .status(200)
      .json({
        message: "Proposalesandels Accountwise Updated successfully",
        updatedProposalesandelsAccountwise,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// sends emails

// const createProposalsAndElsAccounts = async (req, res) => {
//   const {
//     accountids,
//     proposaltemplateid,
//     teammember,
//     proposalname,
//     introduction,
//     terms,
//     servicesandinvoices,
//     introductiontextname,
//     introductiontext,
//     termsandconditionsname,
//     termsandconditions,
//     custommessageinemail,
//     custommessageinemailtext,
//     reminders,
//     daysuntilnextreminder,
//     numberofreminder,
//     servicesandinvoicetempid,
//     invoicetemplatename,
//     invoiceteammember,
//     issueinvoice,
//     specificdate,
//     specifictime,
//     description,
//     lineItems,
//     summary,
//     notetoclient,
//     Addinvoiceoraskfordeposit,
//     Additemizedserviceswithoutcreatinginvoices,
//     paymentterms,
//     paymentduedate,
//     paymentamount,
//     status,
//     active,
//   } = req.body;

//   const missingContactsAccounts = [];

//   // Check if accountids is an array
//   if (!Array.isArray(accountids)) {
//     return res.status(400).json({ error: "accountids must be an array" });
//   }
//   try {
//     for (const accountid of accountids) {
//       await ProposalesandelsAccountwise.create({
//         accountid,
//         proposaltemplateid,
//         teammember,
//         proposalname,
//         introduction,
//         terms,
//         servicesandinvoices,
//         introductiontextname,
//         introductiontext,
//         termsandconditionsname,
//         termsandconditions,
//         custommessageinemail,
//         custommessageinemailtext,
//         reminders,
//         daysuntilnextreminder,
//         numberofreminder,
//         servicesandinvoicetempid,
//         invoicetemplatename,
//         invoiceteammember,
//         issueinvoice,
//         specificdate,
//         specifictime,
//         description,
//         lineItems,
//         summary,
//         notetoclient,
//         Addinvoiceoraskfordeposit,
//         Additemizedserviceswithoutcreatinginvoices,
//         paymentterms,
//         paymentduedate,
//         paymentamount,
//         status,
//         active,
//       });

//       const account = await Accounts.findById(accountid);

//       for (const contactId of account.contacts) {
//         const contact = await Contacts.findById(contactId);
//         console.log(contact);
//         if (contact.login === true) {
//           if (!contact.email) {
//             missingContactsAccounts.push(account.accountName);
//           } else {
//             const transporter = nodemailer.createTransport({
//               host: "smtp.gmail.com",
//               port: 587,
//               secure: false, // Use STARTTLS
//               auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.EMAIL_PASSWORD,
//               },
//               tls: {
//                 rejectUnauthorized: false, // Only for development
//               },
//             });

//             const mailOptions = {
//               from: process.env.EMAIL,
//               to: contact.email,
//               subject: `Review and sign document: ${proposalname}`,
//               html: `                                                           
//                                 <p><b>${proposalname}</b></p>

//                                 <p>Button not working? Copy and paste this link into your browser:</p>
//                              `,
//             };
//             //     <a href="${proposalLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
//             //     Review and Sign
//             // </a>
//             // <p>${username} has sent the following for your review and signature:</p>
//             // <p><a href="${proposalLink}">${proposalLink}</a></p>
//             await transporter.sendMail(mailOptions);
//             console.log(`Email sent to ${contact.email}`);
//           }
//         }
//       }
//     }

//     if (missingContactsAccounts.length > 0) {
//       const transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false, // Use STARTTLS
//         auth: {
//           user: "dipeeka.pote52@gmail.com",
//           pass: "togt ljzg urar dlam",
//         },
//       });

//       const missingAccountsList = missingContactsAccounts.join(", ");

//       const mailOptions = {
//         from: "dipeeka.pote52@gmail.com",
//         to: "dipeeka.pote52@gmail.com",
//         subject: "Some proposals were not created",
//         html: `
//                     <p>The following accounts have no contacts who can sign proposals, so we couldn’t create proposals for them:</p>
//                     <p>${missingAccountsList}</p>
//                     <p>Proposal name:</p>
//                     <p>${proposalname}</p>
//                 `,
//       };

//       await transporter.sendMail(mailOptions);
//       console.log("Notification email sent about missing contacts");
//     }

//     return res
//       .status(201)
//       .json({ message: "ProposalesandelsAccountwise created successfully" });
//   } catch (error) {
//     console.error("Error creating ProposalesandelsAccountwise:", error);
//     return res
//       .status(500)
//       .json({ error: "Error creating ProposalesandelsAccountwise" });
//   }
// };

const createProposalsAndElsAccounts = async (req, res) => {
  const {
    accountids,
    proposaltemplateid,
    teammember,
    proposalname,
    introduction,
    terms,
    servicesandinvoices,
    introductiontextname,
    introductiontext,
    termsandconditionsname,
    termsandconditions,
    custommessageinemail,
    custommessageinemailtext,
    reminders,
    daysuntilnextreminder,
    numberofreminder,
    servicesandinvoicetempid,
    invoicetemplatename,
    invoiceteammember,
    issueinvoice,
    specificdate,
    specifictime,
    description,
    lineItems,
    summary,
    notetoclient,
    Addinvoiceoraskfordeposit,
    Additemizedserviceswithoutcreatinginvoices,
    paymentterms,
    paymentduedate,
    paymentamount,
    status,
    active,
  } = req.body;

  // Check if accountids is an array
  if (!Array.isArray(accountids)) {
    return res.status(400).json({ error: "accountids must be an array" });
  }

  try {
    for (const accountid of accountids) {
      await ProposalesandelsAccountwise.create({
        accountid,
        proposaltemplateid,
        teammember,
        proposalname,
        introduction,
        terms,
        servicesandinvoices,
        introductiontextname,
        introductiontext,
        termsandconditionsname,
        termsandconditions,
        custommessageinemail,
        custommessageinemailtext,
        reminders,
        daysuntilnextreminder,
        numberofreminder,
        servicesandinvoicetempid,
        invoicetemplatename,
        invoiceteammember,
        issueinvoice,
        specificdate,
        specifictime,
        description,
        lineItems,
        summary,
        notetoclient,
        Addinvoiceoraskfordeposit,
        Additemizedserviceswithoutcreatinginvoices,
        paymentterms,
        paymentduedate,
        paymentamount,
        status,
        active,
      });

      // Date calculations
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

      // Account info
      const account = await Accounts.findById(accountid);
      const proposalLink = "http://localhost:3000/accountsdash/organizers/6718e47e1b7d40bc7d33611e";

      // Replace placeholders (only account + dates)
      const replacePlaceholders = (template, data) => {
        return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
          return data[placeholder.trim()] || "";
        });
      };

      const Proposalname = replacePlaceholders(proposalname, {
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

      // Example: send internal email/log (optional)
      console.log(`Proposal created for ${account.accountName}: ${Proposalname}`);
      console.log(`Link: ${proposalLink}`);
    }

    return res.status(201).json({ message: "ProposalesandelsAccountwise created successfully" });
  } catch (error) {
    console.error("Error creating ProposalesandelsAccountwise:", error);
    return res.status(500).json({ error: "Error creating ProposalesandelsAccountwise" });
  }
};
//Get a single ServiceTemplate
const getProposalesAndElsAccountwisePrint = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ error: "Invalid ProposalesAndEls Accountwise ID" });
  }
  try {
    const proposalesandelsAccountwise =
      await ProposalesandelsAccountwise.findById(id);

    const account = await Accounts.findById(
      proposalesandelsAccountwise.accountid
    ).populate("contacts");

        // Define placeholder values
    const placeholderValues = {
      ACCOUNT_NAME: account?.accountName || "",
            CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
      CURRENT_DAY_NUMBER: currentDate.getDate(),
      CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
        weekday: "long",
      }),
      CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
      CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
        month: "long",
      }),
      CURRENT_YEAR: currentDate.getFullYear(),
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
      // Add other dynamic placeholders as required
    };

    // Function to replace placeholders in text
    const replacePlaceholders = (template, data) => {
      return template.replace(/\[([\w\s]+)\]/g, (match, placeholder) => {
        return data[placeholder.trim()] || "";
      });
    };

    // Update each invoice's description with placeholders replaced
    proposalesandelsAccountwise.proposalname = replacePlaceholders(
      proposalesandelsAccountwise.proposalname || "",
      placeholderValues
    );
    const updatedcustommessageinemailtext = replacePlaceholders(
      inv.custommessageinemailtext || "",
      placeholderValues
    );
    const updatedintroductiontext = replacePlaceholders(
      inv.introductiontext || "",
      placeholderValues
    );
    const updatedtermasandconditions = replacePlaceholders(
      inv.termsandconditions || "",
      placeholderValues
    );
    if (!proposalesandelsAccountwise) {
      return res
        .status(404)
        .json({ error: "No such ProposalesAndEls Accountwise" });
    }

    res
      .status(200)
      .json({
        message: "ProposalesAndEls Accountwise retrieved successfully",
        proposalesandelsAccountwise,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingProposalsByAccountId = async (req, res) => {
  const { id } = req.params;

  try {
    const pendingProposals = await ProposalesandelsAccountwise.find({
      accountid: id,
      status: "Pending", // Only fetch proposals with status "Pending"
    })
      .populate({ path: "accountid", model: "Accounts" ,populate: { path: "adminUserId", model: "User"}})
      .populate({ path: "proposaltemplateid", model: "ProposalesAndEls" })
      .populate({ path: "teammember", model: "User" });

    if (!pendingProposals || pendingProposals.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending proposals found for this account." });
    }
// Function to process proposal data
    const processProposalData = async (pendingProposals) => {
      for (const proposal of pendingProposals) {
        console.log(proposal.accountid._id);

        // Fetch account details and populate contacts
        const account = await Accounts.findById(
          proposal.accountid._id
        ).populate("contacts");
        if (!account) {
          console.error(`Account not found for ID: ${proposal.accountid._id}`);
          continue;
        }

      
        // Define placeholder values
        const placeholderValues = {
          ACCOUNT_NAME: account.accountName || "",
                   CURRENT_DAY_FULL_DATE: currentDate.toLocaleDateString(),
          CURRENT_DAY_NUMBER: currentDate.getDate(),
          CURRENT_DAY_NAME: currentDate.toLocaleString("default", {
            weekday: "long",
          }),
          CURRENT_MONTH_NUMBER: currentDate.getMonth() + 1,
          CURRENT_MONTH_NAME: currentDate.toLocaleString("default", {
            month: "long",
          }),
          CURRENT_YEAR: currentDate.getFullYear(),
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

        // Replace placeholders in the proposal title or content
        proposal.proposalname = replacePlaceholders(
          proposal.proposalname || "",
          placeholderValues
        );
        proposal.introductiontext = replacePlaceholders( proposal.introductiontext || "",
            placeholderValues
        );
        proposal.termsandconditions = replacePlaceholders(proposal.termsandconditions || "", placeholderValues)
      }
    };

    // Process proposal data
    await processProposalData(pendingProposals);
    res.status(200).json({
      message: "Pending proposals retrieved successfully",
      pendingProposals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const transporter = require("../middleware/nodemailer.js");
const signProposal = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Proposal ID" });
  }

  try {
    const { signature, signedAt, signedBy } = req.body;

    // Update the proposal
    await ProposalesandelsAccountwise.findByIdAndUpdate(id, {
      $set: {
        signature,
        signedAt: new Date(signedAt),
        signedBy,
        status: "Signed",
      },
    });

    // // Re-fetch with population
    // const updatedProposal = await ProposalesandelsAccountwise.findById(id)
    //   .populate({
    //     path: "signedBy",
    //     model: "User",
    //     select: "username email",
    //   })
    //   .populate({
    //     path: "accountid",
    //     model: "Accounts",
    //     populate: {
    //       path: "adminUserId",
    //       model: "User",
    //       select: "emailSyncEmail email username",
    //     },
    //   });
    const updatedProposal = await ProposalesandelsAccountwise.findById(id)
  .populate({
    path: "signedBy",
    model: "User",
    select: "username email"
  })
  .populate({
    path: "accountid",
    model: "Accounts",
    populate: {
      path: "adminUserId",
      model: "User",
      select: "emailSyncEmail email username"
    }
  })
  .lean(); // ?? This ensures plain JS object


    if (!updatedProposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const adminUser = updatedProposal.accountid?.adminUserId;

    // Debug logs
    console.log("Admin User Object:", adminUser);
    console.log(
      "emailSyncEmail exists:",
      adminUser?.emailSyncEmail !== undefined
    );
    console.log("Raw emailSyncEmail:", `"${adminUser?.emailSyncEmail}"`);
    console.log("Raw email:", `"${adminUser?.email}"`);

    // Fallback from emailSyncEmail to email
    const recipientEmail =
      adminUser?.emailSyncEmail?.trim() || adminUser?.email?.trim();

    if (!recipientEmail) {
      throw new Error("No valid email found for admin user");
    }

    console.log("Final recipient email:", recipientEmail);

    // Prepare and send email
    const mailOptions = {
      from: `"Your Service" <${process.env.EMAIL}>`,
      to: recipientEmail,
      subject: `#Proposal Signed by ${
        updatedProposal.signedBy?.username || "Client"
      }`,
      html: `
        <h2>Proposal Signed</h2>
        <p><strong>Account:</strong> ${
          updatedProposal.accountid?.accountName || "N/A"
        }</p>
        <p><strong>Signed by:</strong> ${
          updatedProposal.signedBy?.username || "Unknown User"
        }</p>
        <p><strong>Proposal:</strong> ${updatedProposal.proposalname}</p>
        <p>Signed at: ${new Date(updatedProposal.signedAt).toLocaleString()}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    res.status(200).json({
      message: "Proposal signed and admin notified",
      emailSent: true,
      recipient: recipientEmail,
      proposalId: updatedProposal._id,
    });
  } catch (error) {
    console.error("Error in signProposal:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });

    res.status(500).json({
      error: "Failed to complete proposal signing",
      details: error.message,
      emailSent: false,
    });
  }
};
module.exports = {
  createProposalsAndElsAccounts,
  getProposalesAndElsAccountswise,
  getProposalesAndElsAccountwise,
  deleteProposalesAndElsAccountwise,
  updateProposalesandelsAccountwise,
  getProposalandElsListbyid,
  getProposalandElsListbyAccountid,
  getProposalandElsList,
  getProposalesAndElsAccountwisePrint,
  getPendingProposalesAndElsAccountswise,
  getPendingProposalsByAccountId,
signProposal
};
