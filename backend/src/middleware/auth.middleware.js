import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

// Check if user is team member
export const checkTeamMembership = async (req, res, next) => {
  try {
    const { teamId } = req.params.teamId ? req.params : req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID is required',
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
