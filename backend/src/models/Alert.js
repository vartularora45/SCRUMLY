import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },

  type: {
    type: String,
    enum: ['OVERDUE_TASKS', 'INACTIVE_DEVELOPER', 'NO_COMMITS', 'DEADLINE_RISK', 'TOO_MANY_BLOCKERS', 'GENERAL_RISK'],
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO',
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed, // Can store userIds, taskIds, etc.
    default: {},
  },

}, { timestamps: true });

alertSchema.index({ teamId: 1, isRead: 1 });

export default mongoose.model('Alert', alertSchema);
