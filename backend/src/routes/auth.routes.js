import express from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  GoogleAuth,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register',    register);
router.post('/login',       login);
router.post('/google',      GoogleAuth);
router.post('/refresh',     refreshToken);
router.post('/logout',      logout);

// Protected routes
router.get('/me',           protect, getMe);
router.put('/profile',      protect, updateProfile);
router.post('/logout-all',  protect, logoutAll);

export default router;
