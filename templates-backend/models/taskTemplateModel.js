const mongoose = require('mongoose');


const subtaskSchema = new mongoose.Schema({
    id: {
        type: String,
        // required: true
    },
    text: {
        type: String,
        // required: true
    },
    checked:{
        type: Boolean,
        default : false,
    }
}, { _id: false }); // Disable _id for subtasks as it's already included

const taskTemplateSchema = new mongoose.Schema({
    templatename: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },
    status: {
        type: String,
    },

    taskassignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // type: Array,
    }],

    priority: {
        type: String,
    },

    description: {
        type: String,
    },

    tasktags: [{
        // type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tags', 
   
    }],

    absolutedates: {
        type: Boolean,
        required: [true, 'Absolute dates flag is required']
    },
    startsin: {
        type: Number,
        // required: function () {
        //     return !this.absolutedates;
        // },
        min: [0, 'Starts in must be a positive number']
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
        min: [0, 'Due in must be a positive number']
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
    issubtaskschecked : {
        type: Boolean,
        default : false,
    },
    subtasks: [subtaskSchema],
    active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);
module.exports = TaskTemplate;
