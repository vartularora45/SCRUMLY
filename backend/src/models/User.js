import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    minlength: 6,
    select: false,
    required: function () {
      return this.provider === 'local';
    }
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  tokenVersion: {
    type: Number,
    default: 0,
  },

  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }]

}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.provider !== 'local')
    return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);