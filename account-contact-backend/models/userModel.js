const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true,  },
  email: { type: String, required: true,  },
  password: { type: String, required: true },
  
    login: {
        type: Boolean,
    //    default : false
    },
    notify: {
        type: Boolean,
        // default : false
    },
    emailSync: {
        type: Boolean,
        // default : false
    },
    contactId:{
            type: mongoose.Schema.Types.ObjectId,
           
            ref: "Contacts",
            //required: [true, 'Access is required'],
          },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;