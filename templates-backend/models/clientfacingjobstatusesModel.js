const mongoose = require("mongoose");

const clientfacingjobSchema = new mongoose.Schema({
    clientfacingName: {
        type: String,
        required: [true, 'Tag name is required'],
    },
    clientfacingColour: {
        type: String,
        required: [true, 'Tag color is required'],
        validate: {
            validator: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
            message: 'Invalid tag color format. It should be a valid hex color code.',
        },
    },
    clientfacingdescription: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
    
}, { timestamps: true });

const ClientFacingjobStatus = mongoose.model("ClientFacingjobStatus", clientfacingjobSchema);

module.exports = ClientFacingjobStatus;
