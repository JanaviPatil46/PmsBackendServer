const crypto = require('crypto');

exports.generateActivationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.generateExpiryDate = (hours = 24) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};