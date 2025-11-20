const mongoose = require('mongoose');
const Schema = mongoose.Schema


const sidebarDataSchema = new Schema({
    label: { type: String, required: true },
    path: { type: String, required: true },
    icon: { type: String, required: true },
    // submenu: { type: Array, default: [] }
});

module.exports = mongoose.model('clientSidebardata', sidebarDataSchema);
