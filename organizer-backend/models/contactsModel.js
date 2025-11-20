const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateActivationToken, generateExpiryDate } = require('../utils/tokenGenerator');
const contactSchema = new Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
contactName:{type: String},
companyName: {
        type: String
    },
    note: {
        type: String
    },
    ssn: {
        type: Number
    },
tags: [
          {
            type: mongoose.Schema.Types.ObjectId,
                       ref: "Tags",
                    },
        ],
 country: {
        name: {
            type: String,
      
        },
        code: {
            type: String,
           
        }
    },
    
    streetAddress: {
        type: String,
    
    },
    city: {
        type: String,
      
    },
    state: {
        type: String,
       
    },
    postalCode: {
        type: Number,
       
    },
    phoneNumbers: [{ type: String }],

  password: { type: String,  }, // hashed password
  accountIds: [{ type: Schema.Types.ObjectId, ref: 'clientAccount' }],description: {
        type: String
    },
   
    active: {
        type: Boolean,
        default: true,
    },
// Activation fields
  activationToken: { type: String },
  activationTokenExpires: { type: Date },
  isActivated: { type: Boolean, default: false },
 // Password reset fields (NEW)
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
}, { timestamps: true }
);

// Password hash middleware
// contactSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });
// Password hash middleware
contactSchema.pre('save', async function(next) {
  if (!this.password) return next();
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// Method to generate activation token
contactSchema.methods.generateActivationToken = function() {
  this.activationToken = generateActivationToken();
  this.activationTokenExpires = generateExpiryDate();
  this.isActivated = false;
};

// Method to verify activation token
contactSchema.methods.isValidActivationToken = function(token) {
  return this.activationToken === token && 
         this.activationTokenExpires > new Date();
};

// Method to activate account
contactSchema.methods.activateAccount = function() {
  this.activationToken = undefined;
  this.activationTokenExpires = undefined;
  this.isActivated = true;
  this.active = true;
};

// Method to generate reset token (NEW)
contactSchema.methods.generateResetToken = function() {
  this.resetToken = crypto.randomBytes(32).toString('hex');
  this.resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
};

// Method to verify reset token (NEW)
contactSchema.methods.isValidResetToken = function(token) {
  return this.resetToken === token && 
         this.resetTokenExpires > new Date();
};

// Password verification method
contactSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('clientContact', contactSchema);
