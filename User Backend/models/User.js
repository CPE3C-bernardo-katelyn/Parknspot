const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const savedLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  info: { type: String, default: '' },
  icon: { type: String, default: 'Home' },
});

const parkingHistorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, default: '' },
  date: { type: String, default: '' },
  status: { type: String, default: 'Completed' },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, default: '' },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  savedLocations: [savedLocationSchema],
  parkingHistory: [parkingHistorySchema],
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);