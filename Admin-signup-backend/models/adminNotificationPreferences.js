const mongoose = require('mongoose');


// Define the inner notification schema
const NotificationSchema = new mongoose.Schema({
    notificationDescription: {
        type: String,
        required: [true, 'Notification description is required'], // Validation for required notification description
    },
    inbox: {
        type: Boolean,
    },
    email: {
        type: Boolean,
    },
});


// Define the main notification schema
const NotificationMainSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
    },
    notifications: {
        type: [NotificationSchema], // Array of NotificationSchema
    },
    active: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });


const NotificationModel = mongoose.model('Notification', NotificationMainSchema);
module.exports = NotificationModel;
