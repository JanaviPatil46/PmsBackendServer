const mongoose = require('mongoose');

const folderTemplateSchema = new mongoose.Schema({
    templatename: String,
    folderpath : String,
    active: {
        type: Boolean,
        default: true, // Provide a default value if needed
    },

 } , { timestamps: true });
  
  const FolderTemplate = mongoose.model('FolderTemplate', folderTemplateSchema);

module.exports = FolderTemplate;
