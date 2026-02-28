import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
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

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER'],
      default: 'MEMBER',
    }
  }],

  settings: {
    aiModel: {
      type: String,
      default: 'llama-3.3-70b-versatile', 
    },
    confidenceThreshold: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    autoCreateTasks: {
      type: Boolean,
      default: true,
    }
  },

}, { timestamps: true });


teamSchema.index({ 'members.user': 1 });

export default mongoose.model('Team', teamSchema);
