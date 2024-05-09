const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide user name'],
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: [true, 'please provide user password'],
    minlength: 6,
  },
  email: {
    unique: true,
    type: String,
    required: [true, 'please provide user email'],
    validate: {
      validator: validator.isEmail,
      message: 'please provide valid email ',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  if(!this.isModified('password')) return 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (candiatatePassword) {
  const isMatch = await bcrypt.compare(candiatatePassword, this.password);
  return isMatch;
};
module.exports = mongoose.model('User', UserSchema);
