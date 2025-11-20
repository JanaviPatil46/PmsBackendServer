const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    tagName: {
        type: String,
        required: [true, 'Tag name is required'],
    },
    tagColour: {
        type: String,
        required: [true, 'Tag color is required'],
        validate: {
            validator: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
            message: 'Invalid tag color format. It should be a valid hex color code.',
        },
    },
    
}, { timestamps: true });

const tagModel = mongoose.model("Tags", tagSchema);

module.exports = tagModel;
