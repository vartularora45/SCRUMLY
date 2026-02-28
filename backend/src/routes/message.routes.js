import express from 'express';
import {
  createMessage,
  getMessages,
  deleteMessage,
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all message routes
router.use(protect);

// Create message
router.post('/', createMessage);

// Get messages by team
router.get('/:teamId', getMessages);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
