import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },

  description: {
    type: String,
    default: '',
  },

  completedAt: {
    type: Date,
  },

  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'],
    default: 'TODO',
  },

  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },

  sourceMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },

  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },

  aiGenerated: {
    type: Boolean,
    default: true,
  },

  manuallyEdited: {
    type: Boolean,
    default: false,
  },

  columnOrder: {
    type: Number,
    default: 0,
  },

  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now }
  }],

  isArchived: {
    type: Boolean,
    default: false,
  },

  // ── Jira Sync Fields ──────────────────────────────────────
  jiraIssueKey: {
    type: String,
    default: null,   // e.g. "KAN-5"
  },
  jiraSynced: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ['scrumly', 'jira'],
    default: 'scrumly',
  },

}, { timestamps: true });

// Board performance
taskSchema.index({ teamId: 1, status: 1, columnOrder: 1 });
taskSchema.index({ jiraIssueKey: 1 });

export default mongoose.model('Task', taskSchema);