const mongoose = require('mongoose');

const messageschema = new mongoose.Schema({
    message: {
        type: String,
    },
    fromwhome : {
        type: String,
        
    },
    senderid: {
      type: String,

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
const clienttasksSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false,
    }
}, { _id: false });

const AccountwiseChatSchema = new mongoose.Schema({
    accountid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clientAccount',
    },

    chattemplateid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatTemplate',
    },

    templatename: {
        type: String,
       
    },
    from: {
        // type: mongoose.Schema.Types.ObjectId,
         type: String,
    },

    chatsubject: {
        type: String,
    },

    description : [ messageschema ],
 
    sendreminderstoclient: {
        type: Boolean,
    },

    daysuntilnextreminder: {
        type: Number,
    },

    numberofreminders: {
        type: Number,
    },

    clienttasks: [clienttasksSchema],
    adminUserId:{
       type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    active: {
        type: Boolean,
        default: true
    },
  
}, { timestamps: true });

const AccountwiseChat = mongoose.model('AccountwiseChat', AccountwiseChatSchema);
module.exports = AccountwiseChat;