const mongoose = require("mongoose");

const SectionSettingConditionSchema = new mongoose.Schema({
  question: {
    type: String,
    // required: true,
  },
  questionId:{
type: Number
  },
  answer: {
    type: String,

    // required: true,
  },
  optionvalue: {
    type: Boolean,

    // required: true,
  },
});

const QuestionSectionSchema = new mongoose.Schema({
  required: {
    type: Boolean,
    default: false,
  },
  prefilled: {
    type: Boolean,
    default: false,
  },
  conditional: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    // enum: ['All', 'Any'], // Options for mode
    // default: 'All'
  },
  conditions: [SectionSettingConditionSchema],

  descriptionEnabled: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    maxlength: 20480,
    default: "",
  },
});

// Define the form element schema
const organizerSectionSchemaformElementSchema = new mongoose.Schema({
  type: { type: String, required: true },
  id: { type: Number, required: true },
  sectionid: { type: Number, required: true },
  options: [
    {
      id: { type: Number, required: true },
      text: { type: String, required: true },
      selected: { type: Boolean },
    },
  ],
  text: { type: String },
  textvalue: { type: String },
  questionsectionsettings: QuestionSectionSchema,
 fileMetadata: {  // Add this field for file uploads
    fileName: { type: String },
    filePath: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  active: {
    type: Boolean,
    default: false,
  },
});

// Define the main form schema
const SectionSettingSchema = new mongoose.Schema({
  sectionRepeatingMode: {
    type: Boolean,
    default: false,
  },
  buttonName: {
    type: String,
  
  },
 mode: {
    type: String,
    // enum: ['All', 'Any'], // Options for mode
    // default: 'All'
  },

  conditional: {
    type: Boolean,
    default: false,
  },
  conditions: [SectionSettingConditionSchema], // Array of conditions, each with a question and answer
});

const organizerSectionSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  text: { type: String },
  formElements: [organizerSectionSchemaformElementSchema],
  sectionsettings: SectionSettingSchema,
});

const organizerAccountWiseSchema = new mongoose.Schema(
  {
    accountid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
    },

    organizertemplateid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerTemplate",
    },

    organizerName: {
      type: String,
    },

    reminders: {
      type: Boolean,
    },

    noofreminders: {
      type: String,
    },
    daysuntilnextreminder: {
      type: String,
    },

    jobid: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    fileUploadPath: {
      type: String,
    },
    sections: [organizerSectionSchema],

    active: {
      type: Boolean,
      default: true,
    },

    issealed: {
      type: Boolean,
      default: false,
    },
    issubmited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
    },
completedby: {
    type: String,
   // ref: "User", // ?? Replace with actual model name for clients
  },
  },
  { timestamps: true }
);

const OrganizerAccountWise = mongoose.model(
  "OrganizerAccountWise",
  organizerAccountWiseSchema
);
module.exports = OrganizerAccountWise;
