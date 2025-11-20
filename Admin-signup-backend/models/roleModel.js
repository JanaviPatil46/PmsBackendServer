const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role is required"],
      minlength: [2, "Role should be at least 2 characters long"],
      maxlength: [50, "Role cannot exceed 50 characters"],
      trim: true, // Remove leading and trailing whitespaces
    },
    active: {
      type: Boolean,
      default: true, // Provide a default value if needed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("role", roleSchema);
