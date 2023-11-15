const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    required: [true, 'please tell us your name 😡'],
    type: String,
    trim: true,
    maxLength: 40,
    minLength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'Lead-guide', 'admin'],
    default: 'user',
  },
  photo: { type: String, default: 'default.jpg' },
  password: { type: String, required: true, minLength: 8, select: false },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not the same as your password',
    },
  },
  passwordChangedAt: Date,
  passwordRestToken: String,
  otp: String,
  otpExpores: Date,
  totaprota: Date,
  passwordResetExpores: Date,
  active: { type: Boolean, default: true, select: false },
  rand: { type: String },
  verfaExpores: Date,
  verfa: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
  //only run this function if password was modified
  if (!this.isModified('password')) {
    return next();
  }
  //hash the password cost 12 power cpu idk what
  this.password = await bcrypt.hash(this.password, 12);
  //delete the password confirm
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password' || this.isNew)) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctpassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.pre(/^find/, function (next) {
  //this poibt ti te current quary
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.changepasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordRestToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpores = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.createOtp = function () {
  const otp = crypto.randomBytes(6).toString('hex');
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpores = Date.now() + 10 * 60 * 1000;
  return otp;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
