import express from 'express';
import {
  getBoard,
  updateTask,
  deleteTaskById,
  createManualTask,
} from '../controllers/board.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all board routes
router.use(protect);

// Get board for a team
router.get('/:teamId', getBoard);

// Create manual task
router.post('/task', createManualTask);

// Update task
router.patch('/task/:taskId', updateTask);

// Delete task
router.delete('/task/:taskId', deleteTaskById);

export default router;
