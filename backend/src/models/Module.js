import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  description: {
    type: String,
    default: '',
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  status: {
    type: String,
    enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'],
    default: 'HEALTHY',
  },

  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  isArchived: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

moduleSchema.index({ teamId: 1 });

export default mongoose.model('Module', moduleSchema);
