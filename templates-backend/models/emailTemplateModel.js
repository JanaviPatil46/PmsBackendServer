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
    mode: {
        type: String,
        enum: ['contacts', 'account'],
        default: 'contacts' // Assuming contact is the default selected option
    },
    emailbody: {
        type: String,
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    }],
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
module.exports = EmailTemplate;