import express from 'express';
import { register, login, getMe,logoutAll,refreshToken,GoogleAuth } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout-all', protect, logoutAll);
router.post('/google', GoogleAuth);

// Private
router.get('/me', protect, getMe);

export default router;
