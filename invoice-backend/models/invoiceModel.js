const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
// Define the lineItems Schema
const lineItemsSchema = new mongoose.Schema({
  productorService: {
    type: String,
    // required: [true, 'Notification description is required'], // Validation for required notification description
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
    default: false,
  },
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
    account: {
      type: mongoose.Schema.Types.ObjectId,
      // type: Array,
      ref: "clientAccount",
    },
    invoicenumber: {
      type: Number,
      unique: true,
    },
    invoicedate: {
      type: Date,
    },
    description: {
      type: String,
    },

    invoicetemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvoiceTemplate",
    },

    paymentMethod: {
      type: String,
    },

    teammember: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'User',
    },
    payInvoicewithcredits: {
      type: Boolean,
      default: false,
    },

    emailinvoicetoclient: {
      type: Boolean,
      default: false,
    },
    reminders: {
      type: Boolean,
      default: false,
    },
    daysuntilnextreminder: {
      type: Number,
    },

    numberOfreminder: {
      type: Number,
    },
    scheduleinvoice: {
      type: Boolean,
      default: false,
    },

    scheduleinvoicedate: {
      type: Date,
      // default: Date.now,
    },

    scheduleinvoicetime: {
      type: String,
    },

    lineItems: {
      type: [lineItemsSchema],
    },

    summary: {
      type: summarySchema,
    },
    paidAmount: {
      type: Number,
    },
    invoiceStatus: {
      type: String,
    },
    balanceDueAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Apply the AutoIncrement plugin to the `invoicenumber` field
invoiceSchema.plugin(AutoIncrement, { inc_field: "invoicenumber" });

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
