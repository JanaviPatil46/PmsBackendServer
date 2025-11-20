const mongoose = require('mongoose');

// Define the lineItems Schema 
const lineItemsSchema = new mongoose.Schema({
    productorService: {
        type: String,
        // required: [true, 'Product or Service  is required'], // Validation for required notification description
    },
    description: {
        type: String,
    },
    rate: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    tax: {
        type: Boolean,
    }
});


// Define the lineItems Schema 
const summarySchema = new mongoose.Schema({
    subtotal: {
        type: Number,
    },
    taxRate: {
        type: Number,
    },
    taxTotal: {
        type: Number,
    },
    total: {
        type: Number,
    },
  
});



const invoiceTemplateSchema = new mongoose.Schema({
    templatename: {
        type: String,
        required: true
    },

    description: {
        type: String,
    },

    paymentMethod: {
        type: String,
    },
    sendEmailWhenInvCreated: {
        type: Boolean,
    },
    messageForClient: {
        type: String,
    },

    payInvoicewithcredits: {
        type: Boolean,
    },

    sendReminderstoClients: {
        type: Boolean,
    },

    daysuntilnextreminder: {
        type: Number,
    },

    numberOfreminder: {
        type: Number,
    },

    lineItems: {
        type: [lineItemsSchema]
    },

    summary: {
        type: summarySchema,
    },

}, { timestamps: true });

const InvoiceTemplate = mongoose.model('InvoiceTemplate', invoiceTemplateSchema);
module.exports = InvoiceTemplate;
