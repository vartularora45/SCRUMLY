import express from "express";
import { connectToJira, jiraCallback, getJiraStatus, syncJiraProjects, disconnectJira ,importIssues,exportTasksToJira} from '../controllers/jira.controller.js';
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

// callback pe protect nahi lagega — browser redirect mein token nahi hota

router.get('/callback',       jiraCallback);              // ← no protect
router.get('/status',         protect, getJiraStatus);
router.post('/sync-projects', protect, syncJiraProjects);
router.delete('/disconnect',  protect, disconnectJira);
router.post('/import-issues', protect, importIssues);
router.post('/export-tasks', protect, exportTasksToJira);
router.get('/connect', (req, res, next) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, protect, connectToJira);


export default router;