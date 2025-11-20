// models/EsignRequest.js
const mongoose = require("mongoose");

const esignRequestSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Account" },
  status: { type: String, default: "pending" }, // pending, completed, failed
  submissionId: { type: String, default: null },
  externalId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EsignRequest", esignRequestSchema);
