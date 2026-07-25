import express from 'express';
import { getAlerts, markAlertAsRead } from '../controllers/alert.controller.js';
import { protect, checkTeamMembership } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:teamId', protect, checkTeamMembership, getAlerts);
router.put('/:id/read', protect, markAlertAsRead);

export default router;
