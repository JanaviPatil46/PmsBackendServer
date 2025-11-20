const mongoose = require('mongoose');
const Schema = mongoose.Schema


const nweSidebarDataSchema = new Schema({
    label: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String, required: true },
    
});

module.exports = mongoose.model('newsidebardata', nweSidebarDataSchema);
