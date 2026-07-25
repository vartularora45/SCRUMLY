import axios from 'axios';
import JiraIntegration from '../models/jiraintegration.js';
import Task from '../models/Task.js';

// ─── Status Mapping ───────────────────────────────────────────────────────────
const SCRUMLY_TO_JIRA = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
  BLOCKED:     'In Progress',
};

const JIRA_TO_SCRUMLY = {
  'to do':       'TODO',
  'todo':        'TODO',
  'open':        'TODO',
  'in progress': 'IN_PROGRESS',
  'in review':   'IN_PROGRESS',
  'done':        'DONE',
  'closed':      'DONE',
  'resolved':    'DONE',
  'blocked':     'BLOCKED',
};

// ─── Helper: Atlassian API ────────────────────────────────────────────────────
const atlassianApi = (token) =>
  axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

// ─── Get Jira transition ID for a target status ───────────────────────────────
const getTransitionId = async (api, cloudId, issueKey, targetStatus) => {
  // FIX: was missing `const res = await api.get(...)` — was just a dangling URL string
  const res = await api.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/transitions`
  );
  const transitions = res.data.transitions || [];
  const match = transitions.find(
    (t) => t.to.name.toLowerCase() === targetStatus.toLowerCase()
  );
  return match?.id || null;
};

/* =========================================================
   Jira Issues → Scrumly Tasks import
   Fetches all issues from a project and creates tasks
========================================================= */
export const importJiraIssues = async ({ userId, teamId, projectKey }) => {
  const integration = await JiraIntegration.findOne({ userId });
  if (!integration) throw new Error('Jira not connected');

  const api = atlassianApi(integration.accessToken);
  const { cloudId } = integration;

  const jql = `project = "${projectKey}" ORDER BY created DESC`;
  const res = await api.post(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
    { jql, maxResults: 100, fields: ['summary', 'description', 'status', 'priority', 'assignee', 'issuetype'] }
  );

  const issues = res.data.issues || [];
  const imported = [];
  const skipped  = [];

  for (const issue of issues) {
    const { key, fields } = issue;

    const existing = await Task.findOne({ jiraIssueKey: key, teamId });
    if (existing) { skipped.push(key); continue; }

    const jiraStatus = fields.status?.name?.toLowerCase() || 'to do';
    const scrumlyStatus = JIRA_TO_SCRUMLY[jiraStatus] || 'TODO';

    const priority = fields.priority?.name || 'Medium';
    const mappedPriority = ['High', 'Medium', 'Low'].includes(priority) ? priority : 'Medium';

    let description = '';
    try {
      const content = fields.description?.content || [];
      description = content
        .flatMap((block) => block.content || [])
        .filter((node) => node.type === 'text')
        .map((node) => node.text)
        .join(' ')
        .slice(0, 500);
    } catch { description = ''; }

    const task = await Task.create({
      title:        `[${key}] ${fields.summary}`,
      description,
      status:       scrumlyStatus,
      priority:     mappedPriority,
      teamId,
      jiraIssueKey: key,
      jiraSynced:   true,
      source:       'jira',
    });

    imported.push(task);
  }

  return { imported: imported.length, skipped: skipped.length, tasks: imported };
};

/* =========================================================
   Scrumly status change → sync to Jira
========================================================= */
export const syncStatusToJira = async ({ userId, issueKey, newStatus }) => {
  const integration = await JiraIntegration.findOne({ userId });
  if (!integration) return;

  const api = atlassianApi(integration.accessToken);
  const { cloudId } = integration;

  const jiraTargetStatus = SCRUMLY_TO_JIRA[newStatus];
  if (!jiraTargetStatus) return;

  try {
    const transitionId = await getTransitionId(api, cloudId, issueKey, jiraTargetStatus);
    if (!transitionId) {
      console.warn(`⚠️ No Jira transition found for: ${jiraTargetStatus}`);
      return;
    }

    await api.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/transitions`,
      { transition: { id: transitionId } }
    );
    console.log(`✅ Jira synced: ${issueKey} → ${jiraTargetStatus}`);
  } catch (err) {
    console.error(`❌ Jira sync failed for ${issueKey}:`, err.response?.data || err.message);
  }
};

/* =========================================================
   Scrumly task → create Jira issue
========================================================= */
export const createJiraIssue = async ({ userId, projectKey, title, description, priority }) => {
  const integration = await JiraIntegration.findOne({ userId });
  if (!integration) return null;

  const api = atlassianApi(integration.accessToken);
  const { cloudId } = integration;

  const jiraPriority = { High: 'High', Medium: 'Medium', Low: 'Low' }[priority] || 'Medium';

  try {
    const res = await api.post(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`,
      {
        fields: {
          project:     { key: projectKey },
          summary:     title,
          description: {
            type:    'doc',
            version: 1,
            content: [{
              type:    'paragraph',
              content: [{ type: 'text', text: description || '' }],
            }],
          },
          issuetype: { name: 'Task' },
          priority:  { name: jiraPriority },
        },
      }
    );
    console.log(`✅ Jira issue created: ${res.data.key}`);
    return res.data.key;
  } catch (err) {
    console.error('❌ Jira issue create failed:', err.response?.data || err.message);
    return null;
  }
};