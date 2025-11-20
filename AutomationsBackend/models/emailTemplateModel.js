const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    templatename: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
    },

    emailsubject: {
        type: String,
    },

    emailbody: {
        type: String,
    },
    files: [{
        filename: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true } // Add size field
    }],
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
module.exports = EmailTemplate;