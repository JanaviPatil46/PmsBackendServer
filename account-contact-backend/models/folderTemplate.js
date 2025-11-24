const mongoose = require('mongoose');

const folderTemplateSchema = new mongoose.Schema({
    templatename: String,
   
    active: {
        type: Boolean,
        default: true, // Provide a default value if needed
    },

 } , { timestamps: true });
  
  const FolderTemplate = mongoose.model('FolderTemp', folderTemplateSchema);

module.exports = FolderTemplate;
