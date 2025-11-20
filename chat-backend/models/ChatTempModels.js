const mongoose = require('mongoose');




const clienttasksSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false,
    }
}, { _id: false });
const chatTemplateSchema = new mongoose.Schema({
    templatename: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
    },

    chatsubject: {
        type: String,
    },

    description: {
        type: String,
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
    isclienttaskchecked: {
        type: Boolean,
        default: false,
    },
    clienttasks: [clienttasksSchema],

    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ChatTemplate = mongoose.model('ChatTemplate', chatTemplateSchema);
module.exports = ChatTemplate;