import express from 'express';
import { getModules, createModule, updateModule, deleteModule } from '../controllers/module.controller.js';
import { protect, checkTeamMembership } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:teamId', protect, checkTeamMembership, getModules);
router.post('/', protect, createModule);
router.put('/:id', protect, updateModule);
router.delete('/:id', protect, deleteModule);

export default router;
