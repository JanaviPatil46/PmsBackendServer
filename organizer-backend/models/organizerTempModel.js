
const mongoose = require('mongoose');



// Define organizer settings
const organizersettingsSchema = new mongoose.Schema({
  notifyaboutdocumentupload: {
      type: Boolean,
  },
  organizerselfservice: {
      type: Boolean,
  },
  automaticallysealaftersubmission: {
      type: Boolean,
  },
  sendreminderstoclient: {
      type: Boolean,
  },
  daysuntilnextreminder: {
    type: Number,
},

numberofreminders: {
    type: Number,
},
});

// Define a schema for condition
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
    default: false
  },
  conditional: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    // enum: ['All', 'Any'], // Options for mode
    // default: 'All'
  },
  conditions: [SectionSettingConditionSchema],

  descriptionEnabled: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 20480,
    default: ''
  },
  
});

// Define the form element schema
const formElementSchema = new mongoose.Schema({
  type: { type: String, required: true },
  id: { type: Number, required: true },
  sectionid: { type: Number, required: true },
  options: [
    {
      id: { type: Number, required: true },
      text: { type: String, required: true }
    }
  ],
  
  text: { type: String },

  questionsectionsettings: QuestionSectionSchema,


});

// Define the main form schema
const SectionSettingSchema = new mongoose.Schema({
  sectionRepeatingMode: {
    type: Boolean,
    default: false
  },
  buttonName: {
    type: String,
    // required: true,
    // maxlength: 25
  },
 mode: {
    type: String,
    // enum: ['All', 'Any'], // Options for mode
    // default: 'All'
  },

  conditional: {
    type: Boolean,
    default: false
  },
  conditions: [SectionSettingConditionSchema]  // Array of conditions, each with a question and answer
});

const SectionSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  text: { type: String },
  formElements : [formElementSchema],
  textBlock : {type:String},
  sectionsettings: SectionSettingSchema

});



const organizerSchema = new mongoose.Schema({

  templatename: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },

  organizerName: {
    type: String,
    required: [true, 'Organizer Name is required'],
    trim: true
  },

  sections: [SectionSchema],

  organizersettings : organizersettingsSchema ,
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


const OrganizerTemplate = mongoose.model('OrganizerTemplate', organizerSchema);
module.exports = OrganizerTemplate;