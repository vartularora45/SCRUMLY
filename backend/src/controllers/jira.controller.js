import axios from 'axios';
import JiraIntegration from '../models/jiraintegration.js';
import { importJiraIssues } from '../services/jira.sync.js';

const atlassian = (token) =>
  axios.create({
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

export const connectToJira = (req, res) => {
  try {
    const { JIRA_CLIENT_ID, JIRA_REDIRECT_URI } = process.env;
    if (!JIRA_CLIENT_ID || !JIRA_REDIRECT_URI)
      return res.status(500).json({ message: 'Jira OAuth env vars missing' });

    const scope = ['read:me', 'read:jira-work', 'write:jira-work', 'read:jira-user','manage:jira-project','manage:jira-configuration'].join(' ');
    const state = req.user._id.toString();

    const authUrl =
      `https://auth.atlassian.com/authorize` +
      `?audience=api.atlassian.com` +
      `&client_id=${JIRA_CLIENT_ID}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(JIRA_REDIRECT_URI)}` +
      `&response_type=code` +
      `&state=${state}` +
      `&prompt=consent`;

    res.redirect(authUrl);
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate Jira OAuth' });
  }
};

export const jiraCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;
    if (!code) return res.status(400).json({ message: 'Missing authorization code' });

    const tokenRes = await axios.post(
      'https://auth.atlassian.com/oauth/token',
      { grant_type: 'authorization_code', client_id: process.env.JIRA_CLIENT_ID, client_secret: process.env.JIRA_CLIENT_SECRET, code, redirect_uri: process.env.JIRA_REDIRECT_URI },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
    const api = atlassian(access_token);

    const sitesRes = await api.get('https://api.atlassian.com/oauth/token/accessible-resources');
    const site = sitesRes.data[0];
    if (!site) return res.redirect(`${process.env.FRONTEND_URL}/integrations?jira=error`);

    const meRes = await api.get('https://api.atlassian.com/me');
    const jiraUser = meRes.data;

    const projectsRes = await api.get(
      `https://api.atlassian.com/ex/jira/${site.id}/rest/api/3/project/search?maxResults=50`
    );
    const projects = (projectsRes.data.values || []).map(p => ({
      id: p.id, key: p.key, name: p.name, avatarUrl: p.avatarUrls?.['48x48'] || '',
    }));

    await JiraIntegration.findOneAndUpdate(
      { userId },
      { userId, jiraAccountId: jiraUser.account_id, jiraEmail: jiraUser.email, jiraAvatarUrl: jiraUser.picture, jiraSiteUrl: site.url, cloudId: site.id, accessToken: access_token, refreshToken: refresh_token, tokenExpiresAt, projects, connectedAt: new Date(), lastSyncedAt: new Date() },
      { upsert: true, new: true }
    );

    res.redirect(`${process.env.FRONTEND_URL}/integrations?jira=success`);
  } catch (error) {
    console.error('❌ Jira Callback Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/integrations?jira=error`);
  }
};

export const getJiraStatus = async (req, res) => {
  try {
    const integration = await JiraIntegration.findOne({ userId: req.user._id }).select('-accessToken -refreshToken');
    if (!integration) return res.status(200).json({ connected: false });
    return res.status(200).json({ connected: true, ...integration.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const syncJiraProjects = async (req, res) => {
  try {
    const integration = await JiraIntegration.findOne({ userId: req.user._id });
    if (!integration) return res.status(404).json({ message: 'Jira not connected.' });

    const api = atlassian(integration.accessToken);
    const projectsRes = await api.get(
      `https://api.atlassian.com/ex/jira/${integration.cloudId}/rest/api/3/project/search?maxResults=50`
    );
    const projects = (projectsRes.data.values || []).map(p => ({
      id: p.id, key: p.key, name: p.name, avatarUrl: p.avatarUrls?.['48x48'] || '',
    }));

    integration.projects = projects;
    integration.lastSyncedAt = new Date();
    await integration.save();

    return res.status(200).json({ message: `${projects.length} projects synced.`, projects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync Jira projects.' });
  }
};

/* =========================================================
   ★ Import Jira Issues → Scrumly Tasks
   POST /api/jira/import-issues
   Body: { teamId, projectKey }
========================================================= */
export const importIssues = async (req, res) => {
  try {
    const { teamId, projectKey } = req.body;
    if (!teamId || !projectKey)
      return res.status(400).json({ message: 'teamId and projectKey are required' });

    const result = await importJiraIssues({ userId: req.user._id, teamId, projectKey });

    return res.status(200).json({
      message:  `${result.imported} tasks imported, ${result.skipped} skipped.`,
      imported: result.imported,
      skipped:  result.skipped,
      tasks:    result.tasks,
    });
  } catch (error) {
    console.error('❌ Import Issues Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to import issues.' });
  }
};

export const disconnectJira = async (req, res) => {
  try {
    await JiraIntegration.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ message: 'Jira disconnected successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================================================
   ★ Bulk Export — Scrumly Tasks → Jira Issues
   POST /api/jira/export-tasks
   Body: { teamId, projectKey }
========================================================= */
export const exportTasksToJira = async (req, res) => {
  try {
    const { teamId, projectKey } = req.body;
    if (!teamId || !projectKey)
      return res.status(400).json({ message: 'teamId and projectKey are required' });

    const integration = await JiraIntegration.findOne({ userId: req.user._id });
    if (!integration) return res.status(404).json({ message: 'Jira not connected.' });

    const { createJiraIssue } = await import('../services/jira.sync.js');
    const Task = (await import('../models/Task.js')).default;

    // Sirf woh tasks jo abhi Jira mein nahi hain
    const tasks = await Task.find({ teamId, isArchived: false, jiraIssueKey: null });

    if (tasks.length === 0)
      return res.status(200).json({ message: 'All tasks are already synced to Jira!', exported: 0 });

    let exported = 0;
    let failed   = 0;

    for (const task of tasks) {
      const jiraKey = await createJiraIssue({
        userId:      req.user._id,
        projectKey,
        title:       task.title,
        description: task.description,
        priority:    task.priority,
      });

      if (jiraKey) {
        await Task.findByIdAndUpdate(task._id, { jiraIssueKey: jiraKey, jiraSynced: true });
        exported++;
      } else {
        failed++;
      }
    }

    return res.status(200).json({
      message:  `${exported} tasks exported to Jira${failed ? `, ${failed} failed` : ''}.`,
      exported,
      failed,
    });

  } catch (error) {
    console.error('❌ Export Tasks Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to export tasks.' });
  }
};