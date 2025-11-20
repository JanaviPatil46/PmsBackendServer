// const Account = require("../models/accountDetailsModel.js");
// const companyAddress = require("../models/companyAddressModel.js");
// const Tags = require("../models/tagsModel.js");

// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const mongoose = require("mongoose");

// //get all accounts
// const getAccounts = async (req, res) => {
//   try {
//     const accounts = await Account.find({}).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" }).populate({ path: "companyAddress", model: "companyAddress" });
//     //sort({ createdAt: -1 });
//     res.status(200).json({ message: "Accounts retrieved successfully", accounts });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// //Get a single Account
// const getAccount = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid Account ID" });
//   }
//   try {
//     const account = await Account.findById(id);

//     if (!account) {
//       return res.status(404).json({ error: "No such Account" });
//     }

//     res.status(200).json({ message: "Account retrieved successfully", account });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Define the destination folder for uploaded files
//     const uploadDir = "uploads/";
//     // Create the upload directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     // Check if folder name is provided in request body
//     if (req.body.folderName) {
//       const folderPath = path.join(uploadDir, req.body.folderName);
//       // Create the folder if it doesn't exist
//       if (!fs.existsSync(folderPath)) {
//         fs.mkdirSync(folderPath);
//       }
//       cb(null, folderPath);
//       // console.log(folderPath)
//     } else {
//       cb(null, uploadDir);
//     }
//   },
//   filename: function (req, file, cb) {
//     // Define the filename for uploaded files
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// // Initialize Multer with the configured storage
// const upload = multer({ storage: storage });

// // POST a new account
// const createAccount = async (req, res) => {
//   try {
//     let newAccount;
//     let newCompanyAccount;

//     const { clientType, accountName, tags, teamMembers, folderTemplate, contacts, userid, active } = req.body;

//     newAccount = await Account.create({ clientType, accountName, tags, teamMembers, folderTemplate, contacts, userid, active });

//     if (clientType === "Company") {
//       const { companyName, country, streetAddress, city, state, postalCode, active } = req.body;

//       newCompanyAccount = await companyAddress.create({ companyName, country, streetAddress, city, state, postalCode, companyId: newAccount._id, active });
//     }

//     // Create folder based on newAccount._id
//     const accountIdFolder = `uploads/AccountsData/${newAccount._id}`;
//     if (!fs.existsSync(accountIdFolder)) {
//       fs.mkdirSync(accountIdFolder, { recursive: true });
//     }

//     res.status(200).json({
//       message: "Account created successfully",
//       newAccount,
//       newCompanyAccount: newCompanyAccount
//         ? {
//             companyId: newCompanyAccount.companyId,
//             companyName: newCompanyAccount.companyName,
//             country: newCompanyAccount.country,
//             streetAddress: newCompanyAccount.streetAddress,
//             city: newCompanyAccount.city,
//             state: newCompanyAccount.state,
//             postalCode: newCompanyAccount.postalCode,
//             active: newCompanyAccount.active,
//           }
//         : null,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// //delete a Account

// const deleteAccount = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid Account ID" });
//   }

//   try {
//     const deletedAccount = await Account.findByIdAndDelete({ _id: id });
//     if (!deletedAccount) {
//       return res.status(404).json({ error: "No such Account" });
//     }
//     res.status(200).json({ message: "Account deleted successfully", deletedAccount });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// //update a new Account
// const updateAccount = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "Invalid Account ID" });
//   }

//   try {
//     const updatedAccount = await Account.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

//     if (!updatedAccount) {
//       return res.status(404).json({ error: "No such Account" });
//     }

//     res.status(200).json({ message: "Account Updated successfully", updatedAccount });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// //get all accounts List
// const getAccountsList = async (req, res) => {
//   try {
//     const accounts = await Account.find({}).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" });

//     const accountlist = accounts.map((account) => {
//       return {
//         id: account._id,
//         Name: account.accountName,
//         Follow: "",
//         Type: account.clientType,
//         Invoices: "",
//         Credits: "",
//         Tasks: "",
//         Team: account.teamMembers,
//         Tags: account.tags,
//         Proposals: "",
//         Unreadchats: "",
//         Pendingorganizers: "",
//         Pendingsignatures: "",
//         Lastlogin: "",
//       };
//     });

//     //sort({ createdAt: -1 });
//     res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// //get all accounts List
// const getAccountsListById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const accounts = await Account.findById(id).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" });

//     const accountlist = {
//       id: accounts._id,
//       Name: accounts.accountName,
//       Follow: "",
//       Type: accounts.clientType,
//       Invoices: "",
//       Credits: "",
//       Tasks: "",
//       Team: accounts.teamMembers,
//       Tags: accounts.tags,
//       Proposals: "",
//       Unreadchats: "",
//       Pendingorganizers: "",
//       Pendingsignatures: "",
//       Lastlogin: "",
//       Contacts: accounts.contacts,
//     };

//     //sort({ createdAt: -1 });
//     res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getAccountListByUserId = async (req, res) => {
//   const { id } = req.params; // Expecting the user ID to be passed as a URL parameter

//   try {
//     // Fetch accounts based on userid
//     const accounts = await Account.find({ userid: id }) // Changed to find accounts by userid
//       .populate({ path: "tags", model: "tag" })
//       .populate({ path: "teamMembers", model: "User" })
//       .populate({ path: "contacts", model: "Contacts" });

//     if (accounts.length === 0) {
//       return res.status(404).json({ message: "No accounts found for this user" }); // Handle case when no accounts are found
//     }

//     res.status(200).json({ message: "Accounts retrieved successfully", accounts });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   createAccount,
//   getAccount,
//   getAccounts,
//   updateAccount,
//   deleteAccount,
//   getAccountsList,
//   getAccountsListById,
//   getAccountListByUserId,
// };

const Account = require("../models/accountDetailsModel.js");
const companyAddress = require("../models/companyAddressModel.js");
const Tags = require("../models/tagsModel.js");
const Contacts = require("../models/contactsModel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const mongoose = require("mongoose");

//get all accounts
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({}).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" });
    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single Account
const getAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }
  try {
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: "No such Account" });
    }

    res.status(200).json({ message: "Account retrieved successfully", account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder for uploaded files
    const uploadDir = "uploads/";
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    // Check if folder name is provided in request body
    if (req.body.folderName) {
      const folderPath = path.join(uploadDir, req.body.folderName);
      // Create the folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      cb(null, folderPath);
      // console.log(folderPath)
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    // Define the filename for uploaded files
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize Multer with the configured storage
const upload = multer({ storage: storage });

// POST a new account
const createAccount = async (req, res) => {
  try {
    let newAccount;
    let newCompanyAccount;

    const { clientType, accountName, tags, teamMembers, folderTemplate, contacts, active, userid } = req.body;

    newAccount = await Account.create({ clientType, accountName, tags, teamMembers, folderTemplate, contacts, active, userid });

    if (clientType === "Company") {
      const { companyName, country, streetAddress, city, state, postalCode, active } = req.body;

      newCompanyAccount = await companyAddress.create({ companyName, country, streetAddress, city, state, postalCode, companyId: newAccount._id, active });
    }

    // Create folder based on newAccount._id
    const accountIdFolder = `uploads/AccountsData/${newAccount._id}`;
    if (!fs.existsSync(accountIdFolder)) {
      fs.mkdirSync(accountIdFolder, { recursive: true });
    }

    res.status(200).json({
      message: "Account created successfully",
      newAccount,
      newCompanyAccount: newCompanyAccount
        ? {
            companyId: newCompanyAccount.companyId,
            companyName: newCompanyAccount.companyName,
            country: newCompanyAccount.country,
            streetAddress: newCompanyAccount.streetAddress,
            city: newCompanyAccount.city,
            state: newCompanyAccount.state,
            postalCode: newCompanyAccount.postalCode,
            active: newCompanyAccount.active,
          }
        : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete a Account

const deleteAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }

  try {
    const deletedAccount = await Account.findByIdAndDelete({ _id: id });
    if (!deletedAccount) {
      return res.status(404).json({ error: "No such Account" });
    }
    res.status(200).json({ message: "Account deleted successfully", deletedAccount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a new Account
const updateAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Account ID" });
  }

  try {
    const updatedAccount = await Account.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

    if (!updatedAccount) {
      return res.status(404).json({ error: "No such Account" });
    }

    res.status(200).json({ message: "Account Updated successfully", updatedAccount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get all accounts List
const getAccountsList = async (req, res) => {
  try {
    const accounts = await Account.find({}).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" });

    const accountlist = accounts.map((account) => {
      return {
        id: account._id,
        Name: account.accountName,
        Follow: "",
        Type: account.clientType,
        Invoices: "",
        Credits: "",
        Tasks: "",
        Team: account.teamMembers,
        Tags: account.tags,
        Proposals: "",
        Unreadchats: "",
        Pendingorganizers: "",
        Pendingsignatures: "",
        Lastlogin: "",
      };
    });

    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all accounts List
const getAccountsListById = async (req, res) => {
  const { id } = req.params;

  try {
    const accounts = await Account.findById(id).populate({ path: "tags", model: "tag" }).populate({ path: "teamMembers", model: "User" }).populate({ path: "contacts", model: "contact" });

    const accountlist = {
      id: accounts._id,
      Name: accounts.accountName,
      Follow: "",
      Type: accounts.clientType,
      Invoices: "",
      Credits: "",
      Tasks: "",
      Team: accounts.teamMembers,
      Tags: accounts.tags,
      Proposals: "",
      Unreadchats: "",
      Pendingorganizers: "",
      Pendingsignatures: "",
      Lastlogin: "",
      Contacts: accounts.contacts,
    };

    //sort({ createdAt: -1 });
    res.status(200).json({ message: "Accounts retrieved successfully", accountlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get all accounts List by accountid
const getAccountListByUserId = async (req, res) => {
  const { id } = req.params; // Expecting the user ID to be passed as a URL parameter

  try {
    // Fetch accounts based on userid
    const accounts = await Account.find({ userid: id }) // Changed to find accounts by userid
      .populate({ path: "tags", model: "Tags" })
      .populate({ path: "teamMembers", model: "User" })
      .populate({ path: "contacts", model: "Contacts" });

    if (accounts.length === 0) {
      return res.status(404).json({ message: "No accounts found for this user" }); // Handle case when no accounts are found
    }

    res.status(200).json({ message: "Accounts retrieved successfully", accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAccount,
  getAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  getAccountsList,
  getAccountsListById,
  getAccountListByUserId,
};
