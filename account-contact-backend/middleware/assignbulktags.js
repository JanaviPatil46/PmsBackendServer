const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Account = require('../models/AccountNewModel');
const moment = require('moment');

router.post("/assignbulktags/tomultipleaccount", async (req, res) => { // Add the '/' here
    // console.log(req.body);
    const { accounts, tags } = req.body;

    try {
        await Account.updateMany(
            { _id: { $in: accounts } },
            { $addToSet: { tags: { $each: tags } } }
        );
        res.status(200).json({ message: 'Tags assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning tags', error });
    }
});

router.post("/assignbulktags/removetags", async (req, res) => {
    const { accounts, tags } = req.body;

    try {
        await Account.updateMany(
            { _id: { $in: accounts } },
            { $pull: { tags: { $in: tags } } }  // $pull removes matching tags from the array
        );
        res.status(200).json({ message: 'Tags removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing tags', error });
    }
});

module.exports = router;
