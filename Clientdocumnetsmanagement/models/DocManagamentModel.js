const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowedToUpdate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    allowedToDelete: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    allowedToView: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Document = mongoose.model("DocumentsManagement", documentSchema);
module.exports = Document;
