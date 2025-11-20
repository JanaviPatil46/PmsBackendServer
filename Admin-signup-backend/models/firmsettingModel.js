const mongoose = require("mongoose");

const firmsettingsSchema = new mongoose.Schema({
    firmName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
        trim: true,
    },
    firmEmail: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    streetAddress: {
        type: String,
        required: false,
        trim: true,
    },
    city: {
        type: String,
        required: false,
        trim: true,
    },
    state: {
        type: String,
        required: false,
        // minlength: 2,
        // maxlength: 50,
        // trim: true,
    },
    postalCode: {
        type: Number,
        required: false,
        min: 100000, // Minimum 6-digit postal code
        max: 999999, // Maximum 6-digit postal code
    },
    firmPhoneNumber: {
        type: Number,
        required: false,
        // min: 1000000000, // Minimum 10-digit number
        // max: 9999999999, // Maximum 10-digit number
    },
    firmwebsite: {
        type: String,
        required: false,
        trim: true,
    },
    defaultreplytoemails: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    receivecopiesBCC: {
        type: Boolean
    },
    aboutusDescription: {
        type: String
    },
    showfirmownerphototologin: {
        type: Boolean
    },
    firmURL: {
        type: String,
        required: false,
        // validate: {
        //     validator: function (v) {
        //         // Simple regex to validate URL format
        //         return /^(ftp|http|https):\/\/[^ "]+$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid URL!`
        // }
    },
    domainname: {
        type: String,
    },
    emailaddressfor2FA: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    require2FAforallteam: {
        type: Boolean
    },
    allowclienttocreatenewchat: {
        type: Boolean
    },

    currency: {
        type: String,
        required: false,
        minlength: 2,
        maxlength: 3,
        trim: true,
    },
    facebooklink: {
        type: String,
    },
    linkedinlink: {
        type: String,
    }
    ,
    xlink: {
        type: String,
    },
    instagramlink: {
        type: String,
    },
    logouploadlink: {
        type: String, // This can store the file path or URL of the profile picture
        required: false, // Not required, can be optional
    },
    defaultlanguage: {
        type: String,
        required: false,
        minlength: 2,
        maxlength: 50,
        trim: true,
    },
    timezone: {
        type: String
    },
    contactnameformat: {
        type: String
    },
    applytoallcontacts: {
        type: Boolean
    },
    defaultdateformatforesign: {
        type: String
    },
    showKBAverification: {
        type: Boolean
    },
    showQESAdESverification: {
        type: Boolean
    },
    giveaccountaccessteammembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    allowsupportteamsetuplanding: {
        type: Boolean
    },
    allowsupportteamsetuplandingdate: {
        type: Date
    },
    allowsupportteamownerlikepermission: {
        type: Boolean
    },
    allowsupportteamownerlikepermissiondate: {
        type: Date
    },
    defaultfoldertemp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'folder',
    },
    showfirmcontactdetails: {
        type: Boolean
    },
    showsocialnetworklinks: {
        type: Boolean
    },
    showfirmlogo: {
        type: Boolean
    },
    showmesscontextinternalnotification: {
        type: Boolean
    },
    showmesscontextclientfacingnotification: {
        type: Boolean
    },
    emailfirmmembercansend: {
        type: Number
    },
    showdoneuploadingbutton: {
        type: Boolean
    },
    showdoneuploadingcheckbox: {
        type: Boolean
    },
    adminuserid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    active: {
        type: Boolean,
        default: true
    },
    country: {
      type: String,
    },
    
}, { timestamps: true });


const firmsettings = mongoose.model("firmsettings", firmsettingsSchema);
module.exports = firmsettings;