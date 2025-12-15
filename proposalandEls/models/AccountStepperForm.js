import mongoose from "mongoose";


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
const invoiceSchema = new mongoose.Schema(
  {
    invoiceTemplate: {
      type: mongoose.Schema.Types.ObjectId,
     
    },
    teamMember: { type: String },
    description: { type: String },
    lineItems: [lineItemsSchema],
      summary: {
        type: summarySchema,
    },
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    noteforClient: { type: String },
  },
  { _id: false }
);

const AccountStepperFormSchema = new mongoose.Schema(
  {
    // GENERAL
    general: {

      skipStepper: { type: Boolean, default: false },
      introductionEnabled: { type: Boolean, default: true },
      termsEnabled: { type: Boolean, default: true },
      servicesEnabled: { type: Boolean, default: true },
      paymentsEnabled: { type: Boolean, default: false },
      proposalTemp: {  type: mongoose.Schema.Types.ObjectId, },
      account:{ type: mongoose.Schema.Types.ObjectId,},
      proposalName: { type: String },
      teamMembers: [{  type: mongoose.Schema.Types.ObjectId, }],
    },

    // INTRODUCTION
    introduction: {
      title: { type: String },
      description: { type: String },
    },

    // TERMS
    terms: {
      title: { type: String },
      description: { type: String },
    },

    // SERVICES & INVOICES
    services: {
      option: {
        type: String,
        enum: ["invoice", "services", ""],
        default: "",
      },
      invoices: [invoiceSchema], 
      itemizedData: {
       lineItems: [lineItemsSchema],
      summary: {
        type: summarySchema,
    },
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
      },
    },

    // PAYMENTS
    payments: {
      method: { type: String }, // e.g. "credit card", "bank transfer"
      amount: { type: Number }, // JSON string or structured fields
    },
  },
  { timestamps: true }
);

export default mongoose.model("AccountStepperForm", AccountStepperFormSchema);

