import User from '../models/User.js';
import {sendOTPEmail} from '../services/email.service.js';
import Invite from '../models/invite.model.js';

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Invite.generateOTP();
        sendOTPEmail({ toEmail: email, inviterName: 'Scrumly', teamName: 'Password Reset', otp });
        res.status(200).json({ message: 'OTP sent to email' });
        
    }
    catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }

};