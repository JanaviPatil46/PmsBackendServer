// models/InvoiceLock.js
const mongoose = require("mongoose");

const invoiceLockSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId, // assuming this references an invoice
   // required: true,
    ref: "Invoice" // optional: reference to your Invoice collection
  },
  documentPath: {
    type: String,
    required: true
  },
status: {
    type: String,
    },
  timestamp: {
    type: Date,
    default: Date.now // auto-set to current timestamp
  }
});

const InvoiceLock = mongoose.model("InvoiceLock", invoiceLockSchema);

module.exports = InvoiceLock;
