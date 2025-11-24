const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  accountName: { type: String, required: true,unique: true, },
  clientType: { type: String,  enum: ["Individual", "Company"], required: true },
  companyName: { type: String },
  contacts: [{
    contact: { type: Schema.Types.ObjectId, ref: 'clientContact', required: true },
    canLogin: { type: Boolean, default: false },
canNotify:{ type: Boolean, default: false },
canEmailSync:{ type: Boolean, default: false },
  }],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // type: Array,
        ref: "Tags",
        // required: true
      },
    ],

    teamMember: [
      {
                type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Team members are required"],
      },
    ],
folderTemp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FolderTemp",
    },
    country: {
      name: {
        type: String,
      },
      code: {
        type: String,
      },
    },

    streetAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: Number,
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
 profilePicture: {
    type: String,  // e.g. "uploads/accounts/abc123.png"
  },
active: {
      type: Boolean,
      default: true,
    },
  
}, { timestamps: true });

module.exports = mongoose.model('clientAccount', accountSchema);
