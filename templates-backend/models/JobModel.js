const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts',
    }],

    pipeline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pipeline',
    },

    stageid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stage' // Reference to the 'stageSchema'
    },
    templatename: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobTemplate'
    },
    jobname: {
        type: String,
    },

    addshortcode: {
        type: String,
    },

    jobassignees: [{
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    priority: {
        type: String,
        // enum: ['Urgent', 'High', 'Medium', 'Low'],
        required: [true, 'Priority is required']
    },

    description: {
        type: String,
    },
    absolutedates: {
        type: Boolean,
        required: [true, 'Absolute dates flag is required']
    },
    startsin: {
        type: Number,
        required: function () {
            return !this.absolutedates;
        },
        min: [0, 'Starts in must be a positive number']
    },
    startsinduration: {
        type: String,
        enum: ['Days', 'Months', 'Years',''],
        required: function () {
            return !this.absolutedates;
        }
    },
    duein: {
        type: Number,
        required: function () {
            return !this.absolutedates;
        },
        min: [0, 'Due in must be a positive number']
    },
    dueinduration: {
        type: String,
        enum: ['Days', 'Months', 'Years',''],
        required: function () {
            return !this.absolutedates;
        }
    },
    startdate: {
        type: Date,
        required: function () {
            return this.absolutedates;
        }
    },
    enddate: {
        type: Date,
        required: function () {
            return this.absolutedates;
        }
    },
    comments: [
        {
          type: String,
        },
      ],
      showinclientportal: {
        type: Boolean,
      },
  
      jobnameforclient: {
        type: String,
      },
  
      clientfacingstatus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientFacingjobStatus",
      },
      clientfacingDescription: {
        type: String,
      },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;