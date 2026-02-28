import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },

  tokenVersion: {
    type: Number,
    default: 0,
  },

  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],

}, { timestamps: true });

// Index for login speed
userSchema.index({ email: 1 });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  if (this.password.length < 6) {
    throw new Error('Password too short');
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
