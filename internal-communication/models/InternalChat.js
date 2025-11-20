const mongoose = require("mongoose");

const messageschema = new mongoose.Schema({
  message: {
    type: String,
  },
  fromwhome: {
    type: String,
  },
  senderid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  time: {
    type: Date,
    default: Date.now, // Automatically set the current time when the document is created
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false, // Initially false, set to true when the receiver reads it
  },

 
});

// const InternalChatSchema = new mongoose.Schema(
//   {
//     teammemberid: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     description: [messageschema],


//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );
const InternalChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    description: [messageschema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const InternalChat = mongoose.model(
  "TeammemberChat",
  InternalChatSchema
);
module.exports = InternalChat;
