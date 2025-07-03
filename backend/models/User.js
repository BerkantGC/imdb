const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  profilePhoto: {
    type: String,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 