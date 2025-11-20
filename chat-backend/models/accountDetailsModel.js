const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    clientType: {
        type: String,
        required: [true, 'Client type is required'],

    },
    accountName: {
        type: String,
        required: [true, 'Account name is required'],
    },
    tags: [{
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tag',
        // required: true
    }],

    teamMembers: [{

        type: Array,
        type: mongoose.Schema.Types.ObjectId, ref: 'admin',
        required: [true, 'Team members are required'],

    }],
    // companyName: {
    //     type: String,
    //     required: [false, 'Company name is required'],
    // },
    folderTemplate: {
        type: String,
        //  required: [true, 'Folder template is required'],
    },

    contacts: [
        {
            type: Array,
            type: mongoose.Schema.Types.ObjectId, ref: 'contact',
            // required    : [true, 'Contacts are required'],
        }
    ],

    active: {
        type: Boolean,
        default: true, // Provide a default value if needed
    },

}, { timestamps: true });

const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel;
