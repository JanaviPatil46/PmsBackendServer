const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const teammemberSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: true,

    },
    phoneNumber: {
        type: String,
        min: 1000000000, // Minimum 10-digit number
        max: 9999999999, // Maximum 10-digit number
    },
    role: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"], // Email format validation
    },
    managePayments: {
        type: Boolean,
    },
    manageInvoices: {
        type: Boolean,
    },
    managePipelines: {
        type: Boolean,
    },
    manageJobRecurrence: {
        type: Boolean,
    },
    manageTimeEntries: {
        type: Boolean,
    },
    manageRatesinTimeEntries: {
        type: Boolean,
    },
    manageAccounts: {
        type: Boolean,
    },
    viewallAccounts: {
        type: Boolean,
    },
    manageTags: {
        type: Boolean,
    },
    manageCustomFields: {
        type: Boolean,
    },
    manageOrganizers: {
        type: Boolean,
    },
    assignTeamMates: {
        type: Boolean,
    },
    chargeFirmBalance: {
        type: Boolean,
    },
    viewAllContacts: {
        type: Boolean,
    },
    manageContacts: {
        type: Boolean,
    },
    manageProposals: {
        type: Boolean,
    },
    manageSites: {
        type: Boolean,
    },
    manageEmails: {
        type: Boolean,
    },
    manageServices: {
        type: Boolean,
    },
    editOrganizersAnswers: {
        type: Boolean,
    },
    managePublicFilterTemplates: {
        type: Boolean,
    },
    manageDocuments: {
        type: Boolean,
    },
    manageTemplates: {
        type: Boolean,
    },
    manageIRSTranscripts: {
        type: Boolean,
    },
    manageMarketPlace: {
        type: Boolean,
    },
    viewReporting: {
        type: Boolean,
    },
    password: {
        type: String,
        minlength: 6, // Minimum length of 6 characters
    },
    cpassword: {
        type: String,
        validate: {
            validator: function (v) {
                return this.password === v; // Ensure cpassword matches password
            },
            message: "Passwords do not match",
        },
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
    },
    active: {
        type: Boolean,
        default: true
    },
    profilePicture: {
        type: String, // This can store the file path or URL of the profile picture
        required: false, // Not required, can be optional
    },



}, { timestamps: true });


// Hash the password before saving
teammemberSchema.pre("save", async function (next) {
    if (!this.isModified("password", "cpassword")) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = bcrypt.hash(this.password, salt);
      this.cpassword = bcrypt.hash(this.cpassword, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
  

const teammemberModel = mongoose.model("teammember", teammemberSchema);
module.exports = teammemberModel;