// models/EsignRequest.js
const mongoose = require("mongoose");

const esignRequestSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "clientAccount" },
  status: { type: String, default: "pending" }, // pending, completed, failed
  submissionId: { type: String, default: null },
  externalId: { type: String, required: true },
 submitters: [
    {
      id: Number,
      slug: String,
      uuid: String,
      name: String,
      email: String,
      phone: String,


      completed_at: Date,
      declined_at: Date,
      external_id: String,
      submission_id: Number,
      metadata: mongoose.Schema.Types.Mixed,
      opened_at: Date,
      sent_at: Date,
      updated_at: Date,
      status: String,
      application_key: String,
      preferences: mongoose.Schema.Types.Mixed,
      role: String
    }
  ],  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EsignRequest", esignRequestSchema);
