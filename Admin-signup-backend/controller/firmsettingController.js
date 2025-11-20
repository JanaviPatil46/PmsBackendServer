const FirmSetting = require('../models/firmsettingModel')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

//get   Firm Settings ByTeamMember
const getFirmSettingsByTeamMember = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "Invalid User ID" });
    }

    try {
        const firmSettings = await FirmSetting.find({
            giveaccountaccessteammembers: userId
        });

        if (firmSettings.length === 0) {
            return res.status(404).json({ error: "No Firm Settings found for this team member" });
        }

        res.status(200).json({
            message: "Firm Settings retrieved successfully",
            firmSettings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// GET all FirmSetting
const getFirmSettings = async (req, res) => {
    try {
        const FirmSettings = await FirmSetting.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "Firm Setting retrieved successfully", FirmSettings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET a single FirmSettings
const getFirmSetting = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Firm Setting ID" });
    }
    try {
        const firmSetting = await FirmSetting.findById(id);
        if (!firmSetting) {
            return res.status(404).json({ error: "No such Firm Setting" });
           
        }
        res.status(200).json({ message: "Firm Setting retrieved successfully", firmSetting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get firmsetting by id
const getFirmSettingsByAdminUserId = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Admin User ID" });
    }

    try {
        const firmSettings = await FirmSetting.find({ adminuserid: id })
        // .populate('giveaccountaccessteammembers', 'User');
        .populate({ path: 'giveaccountaccessteammembers', model: 'User' });
        if (!firmSettings || firmSettings.length === 0) {
            return res.status(404).json({ error: "No Firm Settings found for this Admin User" });
        }

        res.status(200).json(firmSettings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST create a new Admin
const createFirmSetting = async (req, res) => {
    const { 
        firmName,
        firmEmail,
        streetAddress,
        city,
        state,
        postalCode,
        firmPhoneNumber,
        firmwebsite,
        defaultreplytoemails,
        receivecopiesBCC,
        aboutusDescription,
        showfirmownerphototologin,
        firmURL,
        domainname,
        emailaddressfor2FA,
        require2FAforallteam,
        allowclienttocreatenewchat,
        currency,
        facebooklink,
        linkedinlink,
        xlink,
        instagramlink,
        logouploadlink,
        defaultlanguage,
        timezone,
        contactnameformat,
        applytoallcontacts,
        defaultdateformatforesign,
        showKBAverification,
        showQESAdESverification,
        giveaccountaccessteammembers,
        allowsupportteamsetuplanding,
        allowsupportteamsetuplandingdate,
        allowsupportteamownerlikepermission,
        allowsupportteamownerlikepermissiondate,
        defaultfoldertemp,
        showfirmcontactdetails,
        showsocialnetworklinks,
        showfirmlogo,
        showmesscontextinternalnotification,
        showmesscontextclientfacingnotification,
        emailfirmmembercansend,
        showdoneuploadingbutton,
        showdoneuploadingcheckbox,
        adminuserid,
        active
     } = req.body;

    try {
        //check the email already exists
        const existingFirmSetting = await FirmSetting.findOne({ defaultreplytoemails });
        if (existingFirmSetting) {
            return res.status(400).json({ message: "Firm Setting with this Email already exists" });
        }

        const firmSetting = await FirmSetting.create({

            firmName,
            firmEmail,
            streetAddress,
            city,
            state,
            postalCode,
            firmPhoneNumber,
            firmwebsite,
            defaultreplytoemails,
            receivecopiesBCC,
            aboutusDescription,
            showfirmownerphototologin,
            firmURL,
            domainname,
            emailaddressfor2FA,
            require2FAforallteam,
            allowclienttocreatenewchat,
            currency,
            facebooklink,
            linkedinlink,
            xlink,
            instagramlink,
            logouploadlink,
            defaultlanguage,
            timezone,
            contactnameformat,
            applytoallcontacts,
            defaultdateformatforesign,
            showKBAverification,
            showQESAdESverification,
            giveaccountaccessteammembers,
            allowsupportteamsetuplanding,
            allowsupportteamsetuplandingdate,
            allowsupportteamownerlikepermission,
            allowsupportteamownerlikepermissiondate,
            defaultfoldertemp,
            showfirmcontactdetails,
            showsocialnetworklinks,
            showfirmlogo,
            showmesscontextinternalnotification,
            showmesscontextclientfacingnotification,
            emailfirmmembercansend,
            showdoneuploadingbutton,
            showdoneuploadingcheckbox,
            adminuserid,
            active
        });
        res.status(200).json({ message: "Firm Setting created successfully", firmSetting });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE a FirmSetting
const deleteFirmSetting = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Firm Setting ID" });
    }

    try {
        const firmSetting = await FirmSetting.findOneAndDelete({ _id: id });

        if (!firmSetting) {
            return res.status(404).json({ error: "No such Firm Setting" });
        }

        res.status(200).json({ message: "Firm Setting deleted successfully", firmSetting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE a FirmSetting
const updateFirmSetting = async (req, res) => {
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Firm Setting ID" });
    }

    try {
        const updatedFirmSetting = await FirmSetting.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedFirmSetting) {
            return res.status(404).json({ error: "No such Firm Setting" });
        }

        res.status(200).json({ message: "Firm Setting updated successfully", admin: updatedFirmSetting });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




module.exports = {
    createFirmSetting,
    getFirmSettings,
    getFirmSetting,
    deleteFirmSetting,
    updateFirmSetting,
    getFirmSettingsByTeamMember,
    getFirmSettingsByAdminUserId
}



