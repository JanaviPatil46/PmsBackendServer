const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'User', // Assuming you have a User model
    required: true,
  },
  permissions: {
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    download: { type: Boolean, default: false },
    upload: { type: Boolean, default: false },
  },
  path: {
    type: String,
    required: true,
  },
  isNewFile: {
    type: Boolean,
    default: true, // New files default to true
  },
});

// Virtual field to calculate the number of days since upload
documentSchema.virtual('daysSinceUpload').get(function () {
  const now = new Date();
  const uploadedDate = new Date(this.uploadedAt);
  const diffTime = Math.abs(now - uploadedDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
});

// Middleware to update flags and clean up old files
documentSchema.pre('save', function (next) {
  const daysSinceUpload = this.daysSinceUpload;

  // Clear the `isNewFile` flag if the file is older than 2 days
  if (daysSinceUpload > 2) {
    this.isNewFile = false;
  }

  // Additional cleanup logic (if needed)
  if (daysSinceUpload > 31) {
    this.isNewFile = false; // Ensure the flag is cleared for files older than 31 days
  }

  next();
});

module.exports = mongoose.model('Document', documentSchema);
