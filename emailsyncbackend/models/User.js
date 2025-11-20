const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  access_token: String,
  refresh_token: String,
  expiry_date: Number
});

module.exports = mongoose.model('AuthUser', userSchema);
