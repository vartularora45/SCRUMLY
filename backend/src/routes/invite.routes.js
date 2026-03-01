import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { sendInviteOTP, verifyInviteOTP } from '../controllers/invite.controller.js';

const router = express.Router();

router.use(protect);

router.post('/send-otp',   sendInviteOTP);   // Step 1
router.post('/verify-otp', verifyInviteOTP); // Step 2

export default router;

