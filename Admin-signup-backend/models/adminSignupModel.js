const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  middleName: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    min: 1000000000, // Minimum 10-digit number
    max: 9999999999, // Maximum 10-digit number
  },
  email: {
    type: String,
    required: true,
      trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"],
    // match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"], // Email format validation
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
  firmName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  firmEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
  },
  streetAddress: {
    type: String,
    required: false,
    trim: true,
  },
  city: {
    type: String,
    required: false,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  postalCode: {
    type: Number,
    required: false,
    min: 100000, // Minimum 6-digit postal code
    max: 999999, // Maximum 6-digit postal code
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  firmPhoneNumber: {
    type: Number,
    required: false,
    min: 1000000000, // Minimum 10-digit number
    max: 9999999999, // Maximum 10-digit number
  },
  website: {
    type: String,
    required: false,
    trim: true,
  },
  firmSize: {
    type: Number,
    required: true,
  },
  referenceFrom: {
    type: String,
    required: true,
    enum: ["Google search", "Capterra/ Get app/ G2", "From a friend", "Offline event", "Social media", "Taxdome consultant/ Partner", "Other"],
  },
  services: [{
          type: [String],
        required: true,
        // enum: ["TaxPreparation", "TaxPlanning", "Advisory", "Resolution", "Payroll", "Accounting", "Audit", "LawFirm", "Bookkeeping", "Other"],
      }
  ],

  role: {
    type: String,
    required: true,
    enum: ["Owner or partner", "Book keeper or Accountant", "Operations / office Manager", "Admin", "Assistant", "Other"],
  },
  firmURL: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 3,
    trim: true,
  },
  language: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  userid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  profilePicture: {
    type: String, // This can store the file path or URL of the profile picture
    required: false, // Not required, can be optional
    },
  
});

// Hash the password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password", "cpassword")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.cpassword = await bcrypt.hash(this.cpassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;
