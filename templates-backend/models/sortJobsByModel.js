const mongoose = require('mongoose');

const sortJobsBySchema = new mongoose.Schema({
    description: { type: String, required: true }
},
{ timestamps: true });

const SortJobsBy = mongoose.model('SortJobsBy', sortJobsBySchema);

module.exports = SortJobsBy;