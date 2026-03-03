import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { sendInviteOTP, verifyInviteOTP,forgotPassword ,verifyResetOTP,resetPassword} from '../controllers/invite.controller.js';

const router = express.Router();



router.post('/send-otp',protect,   sendInviteOTP);   // Step 1
router.post('/verify-otp', protect,verifyInviteOTP); // Step 2
 // For password reset OTP
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
export default router;

