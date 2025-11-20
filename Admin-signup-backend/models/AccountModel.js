const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
  {
    clientType: {
      type: String,
      enum: ["Individual", "Company"],
      required: true,
    },
    accountName: { type: String, required: true, uniques: true },
    companyName: { type: String }, // only if Company
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
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
        type: Array,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: [true, "Team members are required"],
      },
    ],

    foldertemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FolderTemplate",
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
        userid:[ {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }],
  },
  { timestamps: true }
);
// const accountSchema = new mongoose.Schema(
//   {
//     clientType: {
//       type: String,
//       required: [true, "Client type is required"],
//     },
//     accountName: {
//       type: String,
//       required: [true, "Account name is required"],
//     },

// tags: [
//   {
//     type: mongoose.Schema.Types.ObjectId,
//     // type: Array,
//     ref: "Tags",
//     // required: true
//   },
// ],

// teamMember: [
//   {
//     type: Array,
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     // required: [true, "Team members are required"],
//   },
// ],

// foldertemplate: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "FolderTemplate",
// },
//     contacts: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Contacts",

//       },
//     ],
//     userid:[ {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     }],

//     description: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//  companyName: {
//       type: String,
//     },

//       country: {
//       name: {
//           type: String,

//       },
//       code: {
//           type: String,

//       }
//   },

//   streetAddress: {
//       type: String,

//   },
//   city: {
//       type: String,

//   },
//   state: {
//       type: String,

//   },
//   postalCode: {
//       type: Number,

//   },
//   adminUserId:{
//      type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   }
// },
//   { timestamps: true }
// );

// Collection
const Accounts = mongoose.model("Accounts", accountSchema);
module.exports = Accounts;


