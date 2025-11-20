const mongoose = require("mongoose");

const jobTemplateSchema = new mongoose.Schema(
  {
    templatename: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    jobname: {
      type: String,
    },

    addshortcode: {
      type: String,
    },

    jobassignees: [
      {
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    priority: {
      type: String,
    },
    description: {
      type: String,
    },
    absolutedates: {
      type: Boolean,
      required: [true, "Absolute dates flag is required"],
    },
    startsin: {
      type: Number,
      // required: function () {
      //     return !this.absolutedates;
      // },
      min: [0, "Starts in must be a positive number"],
    },
    startsinduration: {
      type: String,
      // required: function () {
      //     return !this.absolutedates;
      // }
    },
    duein: {
      type: Number,
      // required: function () {
      //     return !this.absolutedates;
      // },
      min: [0, "Due in must be a positive number"],
    },
    dueinduration: {
      type: String,
      // required: function () {
      //     return !this.absolutedates;
      // }
    },
    startdate: {
      type: Date,
      // required: function () {
      //     return this.absolutedates;
      // }
    },
    enddate: {
      type: Date,
      // required: function () {
      //     return this.absolutedates;
      // }
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
      default: true,
    },
  },
  { timestamps: true }
);

const JobTemplate = mongoose.model("JobTemplate", jobTemplateSchema);
module.exports = JobTemplate;
