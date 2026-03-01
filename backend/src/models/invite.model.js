import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteSchema = new mongoose.Schema({
  teamId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  invitedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email:         { type: String, lowercase: true, trim: true },
  otp:           { type: String, required: true },
  otpExpiresAt:  { type: Date,   required: true },
  role:          { type: String, enum: ['MEMBER', 'ADMIN'], default: 'MEMBER' },
  status: {
    type:    String,
    enum:    ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING',
  },
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000),
  },
}, { timestamps: true });

// TTL index — MongoDB auto-deletes expired docs
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate 6-digit OTP
inviteSchema.statics.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export default mongoose.model('Invite', inviteSchema);