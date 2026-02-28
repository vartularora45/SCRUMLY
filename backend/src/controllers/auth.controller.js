import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';



const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

const sendTokens = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

 
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return accessToken;
};



export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({ name, email, password });

    const defaultTeam = await Team.create({
      name: `${name}'s Team`,
      owner: user._id,
      members: [{ user: user._id, role: 'OWNER' }],
    });

    user.teams.push(defaultTeam._id);
    await user.save();

    const accessToken = sendTokens(res, user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        team: {
          id: defaultTeam._id,
          name: defaultTeam.name,
        },
        accessToken,
      },
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email & password required',
      });
    }

    const user = await User.findOne({ email })
      .select('+password')
      .populate('teams', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = sendTokens(res, user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          teams: user.teams,
        },
        accessToken,
      },
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};


export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken,
    });

  } catch {
    res.status(401).json({ success: false });
  }
};



export const logout = async (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};


export const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 }, 
    });

    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });

  } catch {
    res.status(500).json({ success: false });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('teams', 'name');

    res.json({
      success: true,
      data: user,
    });

  } catch {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};
