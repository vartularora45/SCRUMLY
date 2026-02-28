import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },

  generatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },

  aiProcessed: {
    type: Boolean,
    default: false,
  },

  aiAttempts: {
    type: Number,
    default: 0,
  },

  aiResultSnapshot: {
    task: String,
    status: String,
    confidence: Number,
  },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // ✅ Index for filtering
    },
    deletedAt: {
      type: Date,
      default: null,
    },

  rawAIResponse: {
    type: String,
  }

}, { timestamps: true });

// Feed performance
messageSchema.index({ teamId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
