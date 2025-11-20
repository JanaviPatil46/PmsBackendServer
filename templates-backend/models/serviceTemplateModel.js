const mongoose = require('mongoose');

const ServiceTemplateSchema = new mongoose.Schema({
    serviceName: {
        type: String,
    },

    description: {
        type: String,
    },

    rate: {
        type: String,
    },

    ratetype: {
        type: String,
    },

    tax: {
        type: Boolean,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },

    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ServiceTemplate = mongoose.model('ServiceTemplate', ServiceTemplateSchema);
module.exports = ServiceTemplate;
