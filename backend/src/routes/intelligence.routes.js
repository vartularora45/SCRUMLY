import express from 'express';
import { getProjectIntelligence } from '../controllers/intelligence.controller.js';
import { protect, checkTeamMembership } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/intelligence/:teamId/dashboard
router.get('/:teamId/dashboard', protect, checkTeamMembership, getProjectIntelligence);

export default router;
