const mongoose = require('mongoose');


const clientSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
    },
   foldertempId:{
    type: mongoose.Schema.Types.ObjectId,
        ref: 'FolderTemplate',
   }
   
  }, { timestamps: true });

module.exports = mongoose.model('Clientdocs', clientSchema);
