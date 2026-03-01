import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 🔐 Protect Routes
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};

// 👥 Check Team Membership
export const checkTeamMembership = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required',
      });
    }

    if (!req.user.teams || req.user.teams.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is not part of any team',
      });
    }

    const isMember = req.user.teams.some(
      team => team.toString() === teamId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this team',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking team membership',
    });
  }
};