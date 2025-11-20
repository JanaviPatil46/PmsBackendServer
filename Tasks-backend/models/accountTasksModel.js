const mongoose = require('mongoose');


const subtaskSchema = new mongoose.Schema({
    id: {
        type: String,
       
    },
    text: {
        type: String,
       
    },
    checked:{
        type: Boolean,
        default : false,
    }
}, { _id: false }); // Disable _id for subtasks as it's already

const taskSchema = new mongoose.Schema({
    accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clientAccount',
    },

    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    },

    
    templatename: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskTemplate'
    },
    taskname: {
        type: String,
    },

    status: {
           type: String,
       },
   
       taskassignees: [{
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
        //    type: Array,
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

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;