const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientAccount",
      required: true,
    },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    clientEmail: { type: String, required: true },
description:{type: String},
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Approval", approvalSchema);
