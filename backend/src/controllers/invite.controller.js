import Invite from '../models/invite.model.js';
import Team   from '../models/Team.js';
import User   from '../models/User.js';
import { sendOTPEmail } from '../services/email.service.js';
import { io } from '../server.js';
import bcrypt from 'bcryptjs';

/* =========================================================
   STEP 1 — Send OTP to invitee's email
   POST /api/invites/send-otp
   Body: { teamId, email }
========================================================= */
export const sendInviteOTP = async (req, res) => {
  try {
    const { teamId, email } = req.body;
    if (!teamId || !email)
      return res.status(400).json({ message: 'teamId and email are required' });

    const team = await Team.findById(teamId).populate('owner', 'name');
    if (!team)
      return res.status(404).json({ message: 'Team not found' });

    const ownerId = team.owner?._id?.toString() || team.owner?.toString();
    if (ownerId !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the team owner can invite members' });

    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitee)
      return res.status(404).json({ message: 'No account found with this email. Ask them to sign up first.' });

    const alreadyMember = team.members.some(m => m.user.toString() === invitee._id.toString());
    if (alreadyMember)
      return res.status(400).json({ message: 'This user is already a team member' });

    // Expire old OTPs
    await Invite.updateMany(
      { teamId, invitedUserId: invitee._id, status: 'PENDING' },
      { status: 'EXPIRED' }
    );

    const otp          = Invite.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const invite = await Invite.create({
      teamId,
      invitedBy:     req.user._id,
      invitedUserId: invitee._id,
      email:         invitee.email,
      otp,
      otpExpiresAt,
      expiresAt:     otpExpiresAt,
      status:        'PENDING',
    });

    await sendOTPEmail({
      toEmail:     invitee.email,
      inviterName: team.owner.name,
      teamName:    team.name,
      otp,
    });

    res.json({
      success:     true,
      inviteId:    invite._id,
      inviteeName: invitee.name,
      message:     `OTP sent to ${invitee.email}. Ask ${invitee.name} to share the code with you.`,
    });

  } catch (err) {
    console.error('SEND INVITE OTP ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   STEP 2 — Owner enters OTP → member added
   POST /api/invites/verify-otp
   Body: { inviteId, otp }
========================================================= */
export const verifyInviteOTP = async (req, res) => {
  try {
    const { inviteId, otp } = req.body;
    if (!inviteId || !otp)
      return res.status(400).json({ message: 'inviteId and otp are required' });

    const invite = await Invite.findById(inviteId);
    if (!invite || invite.status !== 'PENDING')
      return res.status(400).json({ message: 'Invite not found or already used' });

    if (invite.otpExpiresAt < new Date()) {
      invite.status = 'EXPIRED';
      await invite.save();
      return res.status(400).json({ message: 'OTP expired. Please send a new invite.' });
    }

    if (invite.otp !== otp.trim())
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });

    const team = await Team.findById(invite.teamId);
    if (!team)
      return res.status(404).json({ message: 'Team not found' });

    const ownerId = team.owner?._id?.toString() || team.owner?.toString();
    if (ownerId !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the team owner can verify the OTP' });

    const already = team.members.some(m => m.user.toString() === invite.invitedUserId.toString());
    if (!already) {
      team.members.push({ user: invite.invitedUserId, role: invite.role || 'MEMBER' });
      await team.save();
      await User.findByIdAndUpdate(invite.invitedUserId, { $addToSet: { teams: team._id } });
    }

    invite.status = 'ACCEPTED';
    await invite.save();

    io.to(invite.invitedUserId.toString()).emit('added_to_team', { teamId: team._id, teamName: team.name });

    const invitee = await User.findById(invite.invitedUserId, 'name email');
    io.to(invite.teamId.toString()).emit('member_joined', { user: invitee });

    const updated = await Team.findById(team._id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    res.json({ success: true, team: updated });

  } catch (err) {
    console.error('VERIFY INVITE OTP ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================================================
   FORGOT PASSWORD — STEP 1: OTP bhejo
   POST /api/invites/forgot-password
   Body: { email }
========================================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: 'No account found with this email.' });

    // Purane pending password-reset OTPs expire karo
    await Invite.updateMany(
      { email: user.email, teamId: null, status: 'PENDING' },
      { status: 'EXPIRED' }
    );

    const otp          = Invite.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invite model reuse — teamId/invitedBy dummy values se avoid karte hain
    // isliye ek placeholder use karo (apna server userId ya koi fixed ObjectId)
    const SYSTEM_ID = user._id; // self-reference — sirf placeholder

    await Invite.create({
      teamId:        user._id,       // placeholder (required field)
      invitedBy:     user._id,       // placeholder (required field)
      invitedUserId: user._id,
      email:         user.email,
      otp,
      otpExpiresAt,
      expiresAt:     otpExpiresAt,
      status:        'PENDING',
      role:          'MEMBER',
    });

    await sendOTPEmail({
      toEmail:     user.email,
      inviterName: 'Scrumly',
      teamName:    'Password Reset',
      otp,
    });

    return res.status(200).json({ message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/* =========================================================
   FORGOT PASSWORD — STEP 2: OTP verify karo
   POST /api/invites/verify-reset-otp
   Body: { email, otp }
========================================================= */
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: 'No account found with this email.' });

    // Latest pending OTP dhundo
    const record = await Invite.findOne({
      invitedUserId: user._id,
      status:        'PENDING',
    }).sort({ createdAt: -1 });

    if (!record)
      return res.status(400).json({ message: 'OTP not found or already expired.' });

    if (record.otpExpiresAt < new Date()) {
      record.status = 'EXPIRED';
      await record.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });

    // Verified mark karo — ACCEPTED status use karenge
    record.status = 'ACCEPTED';
    await record.save();

    return res.status(200).json({ message: 'OTP verified successfully.' });

  } catch (err) {
    console.error('VERIFY RESET OTP ERROR:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

/* =========================================================
   FORGOT PASSWORD — STEP 3: Naya password set karo
   POST /api/invites/reset-password
   Body: { email, otp, newPassword }
========================================================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'Email, OTP and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: 'No account found with this email.' });

    // ACCEPTED record dhundo (verified OTP)
    const record = await Invite.findOne({
      invitedUserId: user._id,
      otp:           otp.trim(),
      status:        'ACCEPTED',
    }).sort({ createdAt: -1 });

    if (!record)
      return res.status(400).json({ message: 'OTP not verified or session expired. Please start over.' });

    // Expiry double-check
    if (record.otpExpiresAt < new Date()) {
      record.status = 'EXPIRED';
      await record.save();
      return res.status(400).json({ message: 'Session expired. Please start over.' });
    }

    // Password hash karke update karo
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Record delete karo — one-time use
    await Invite.deleteOne({ _id: record._id });

    return res.status(200).json({ message: 'Password reset successfully. Please login.' });

  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};