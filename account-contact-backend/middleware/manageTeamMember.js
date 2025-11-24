const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Account = require('../models/AccountModel');
const moment = require('moment');

router.post("/teamMembertomultipleaccount", async (req, res) => { // Add the '/' here
    // console.log(req.body);
    const { accounts, teamMembers } = req.body;

    try {
        await Account.updateMany(
            { _id: { $in: accounts } },
            { $addToSet: { teamMember: { $each: teamMembers } } }
        );
        res.status(200).json({ message: 'Team Member assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning teamMember', error });
    }
});

router.post("/removeteammember", async (req, res) => {
    const { accounts, teamMembers } = req.body;

    try {
        await Account.updateMany(
            { _id: { $in: accounts } },
            { $pull: { teamMember: { $in: teamMembers } } }  // $pull removes matching tags from the array
        );
        res.status(200).json({ message: 'Team Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing Team Member', error });
    }
});

module.exports = router;
