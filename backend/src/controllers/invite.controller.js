import Invite from '../models/invite.model.js';
import Team   from '../models/Team.js';
import User   from '../models/User.js';
import { sendOTPEmail } from '../services/email.service.js';
import { io } from '../server.js';

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