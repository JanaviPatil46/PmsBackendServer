const mongoose = require('mongoose');

const accessRightsSchema = new mongoose.Schema({
    accessDescription: {
        type: String,
        required: [true, 'Access description is required'], // Validation for required access description
    },
    access: {
        type: String,
        required: [true, 'Access is required'] // Validation for required access
    },
    active: {
        type: Boolean,
        default: true
    }
});

const accessRightModel = mongoose.model('accessRights', accessRightsSchema);
module.exports = accessRightModel;
