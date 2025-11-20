// models/automationModel.js
const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  automationType: {
    type: String,
    
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
   
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Automation', automationSchema);
