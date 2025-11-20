const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Accounts",
    },
    noteData: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
