import mongoose from 'mongoose';

const jiraIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // ek user ka ek hi Jira connection
  },
  // Jira account info
  jiraAccountId:  { type: String, required: true },
  jiraEmail:      { type: String },
  jiraAvatarUrl:  { type: String },
  jiraSiteUrl:    { type: String }, // e.g. https://yourcompany.atlassian.net
  cloudId:        { type: String, required: true },

  // OAuth tokens
  accessToken:    { type: String, required: true },
  refreshToken:   { type: String },
  tokenExpiresAt: { type: Date },

  // Fetched projects (cache)
  projects: [
    {
      id:         String,
      key:        String,
      name:       String,
      avatarUrl:  String,
    }
  ],

  connectedAt:    { type: Date, default: Date.now },
  lastSyncedAt:   { type: Date },

}, { timestamps: true });

export default mongoose.model('JiraIntegration', jiraIntegrationSchema);