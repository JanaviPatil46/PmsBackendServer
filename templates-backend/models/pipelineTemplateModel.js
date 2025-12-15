const mongoose = require("mongoose");



// Automation Schema - storing only IDs
const automationSchema = new mongoose.Schema({
  type: {
    type: String,
       enum: [
      "Send Email",
      "Send Invoice",
      "Send Proposal/Els",
      "Create Organizer",
      "Apply folder template",
      "Update account tags",
      "Update job assignees",
      "Create Task",
      "Send message",
      "Update client-facing job status"
    ]
  },
  index: {
    type: Number,
    required: true
  },
  // Store only ID for selectedtemp
  selectedtemp: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'refModel'
  },
  // Store only tag IDs for selectedTags
  selectedTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tags"
  }],
  reminderChecked: {
    type: Boolean,
    default: false
  },
  daysuntilNextReminder: String,
  noOfReminder: String,
  // Store only tag IDs for addTags
  addTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tags"
  }],
  // Store only tag IDs for removeTags
  removeTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tags"
  }],
  // Store only user IDs for selectedAssignees
  selectedAssignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Store only user IDs for assigneesToRemove
  assigneesToRemove: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: mongoose.Schema.Types.Mixed // Can store boolean or object
  },
  // Store only ID for selectedClientStatus
  selectedClientStatus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClientFacingjobStatus"
  },
  clientDescription: String,
  // Reference model fields for dynamic population  
 refModel: {
    type: String,
    enum: ['TaskTemplate', 'EmailTemplate', 'ChatTemplate', 'InvoiceTemplate', 'FolderTemplate', 'OrganizerTemplate', 'ProposalTemplate', null],
    default: null
  }, 
 templateRefModel: {
    type: String,
    enum: ['TaskTemplate', 'EmailTemplate', 'ChatTemplate', 'InvoiceTemplate',  'FolderTemplate', 'OrganizerTemplate','ProposalTemplate', null]
  }
}, { _id: true });

const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Stage name is required"],
  },
   conditions: [{
    // Define your conditions structure based on your requirements
    type: mongoose.Schema.Types.Mixed
  }],
  automations: [automationSchema],  
  automove: {
    type: Boolean,
  },
});


const pipelineSchema = new mongoose.Schema(
  {
    pipelineName: {
      type: String,
      required: [true, "pipelineName is required"],
unique:true
    },

    availableto: [
      {
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Available to are required"],
      },
    ],

    sortjobsby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SortJobsBy",
    },

    defaultjobtemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobTemplate",
    },

    accountId: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    description: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    duedate: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    accounttags: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    priority: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    days_on_Stage: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    assignees: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    name: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    startdate: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },
clientFacing_status: {
      type: Boolean,
      default: false, // Provide a default value if needed
    },

    stages: [stageSchema],

    active: {
      type: Boolean,
      default: true, // Provide a default value if needed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("pipeline", pipelineSchema);
