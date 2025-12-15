// middleware/checkAccountAccess.js
const jwt = require("jsonwebtoken");
const Contact = require('../models/ContactNewModel');
const Account = require('../models/AccountNewModel');

module.exports = async function (req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token, login again" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const accountId = req.headers["accountid"];   // frontend will send accountId

    // Check if user still exists and has access to this account
    const account = await Account.findOne({
      _id: accountId,
      "contacts.contact": decoded.id,
      "contacts.canLogin": true
    });

    if (!account) {
      return res.status(403).json({ message: "Account access revoked" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};
