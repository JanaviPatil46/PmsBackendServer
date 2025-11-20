const mongoose = require('mongoose');

const lineItemsSchema = new mongoose.Schema({
    productorService: {
        type: String,
        // required: [true, 'Product or Service  is required'], // Validation for required notification description
    },
    description: {
        type: String,
    },
    rate: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    amount: {
        type: String,
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

const proposalesandelsSchema = new mongoose.Schema({

    templatename: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },

    teammember: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    proposalname: {
        type: String,
    },

    introduction: {
        type: Boolean,
    },

    terms: {
        type: Boolean,
    },

    servicesandinvoices: {
        type: Boolean,
    },

    introductiontextname: {
        type: String,
    },

    introductiontext: {
        type: String,
    },

    termsandconditionsname: {
        type: String,
    },

    termsandconditions: {
        type: String,
    },

    custommessageinemail: {
        type: Boolean
    },

    custommessageinemailtext: {
        type: String
    },

    reminders: {
        type: Boolean,
    },

    daysuntilnextreminder : {
        type : Number
    },

    numberofreminder : {
        type : Number
    },
        //Serveice and invoice
        
    servicesandinvoicetempid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceTemplate',
    },

    invoicetemplatename: {
        type: String,
    },

    invoiceteammember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    issueinvoice:{
        type: String,
    },

    specificdate:{
        type: Date
    },

    specifictime:{
        type: Date
    },

    description: {
        type: String,
    },  

    lineItems: {
        type: [lineItemsSchema]
    },

    summary: {
        type: summarySchema,
    },

    notetoclient:{
        type: String,
    },

    Addinvoiceoraskfordeposit:{
        type: String,
    },
    Additemizedserviceswithoutcreatinginvoices:{
        type: String,
    },
    paymentterms: {
        type: String,
    },
    paymentduedate: {
        type: String,
    },
    paymentamount: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ProposalesAndEls = mongoose.model('ProposalesAndEls', proposalesandelsSchema);
module.exports = ProposalesAndEls;
