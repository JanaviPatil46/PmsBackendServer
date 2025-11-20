const mongoose = require('mongoose');

const companyAddressSchema = new mongoose.Schema({

    companyName: {
        type: String,
    //    required: [false, 'Company name is required'],
    },

    country: {
        type: String,
    //    required: [true, 'Country is required'],
    },
    streetAddress: {
        type: String,
      //  required: [true, 'Street address is required'],
    },
    city: {
        type: String,
       // required: [true, 'City is required'],
    },
    state: {
        type: String,
        //required: [true, 'State is required'],
    },
    postalCode: {
        type: Number,
        required: [true, 'Postal code is required'],
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Account ID is required'],
    },
    active: {
        type: Boolean,
        default: true, // Provide a default value if needed
    }
})

const companyAddressModel = mongoose.model('companyAddress', companyAddressSchema);
module.exports = companyAddressModel;


