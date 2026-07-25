import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

const sendTokens = (res, user) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path:     '/api/auth/refresh',
    maxAge:   30 * 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });

    const defaultTeam = await Team.create({
      name:    `${name.trim()}'s Team`,
      owner:   user._id,
      members: [{ user: user._id, role: 'OWNER' }],
    });

    user.teams.push(defaultTeam._id);
    await user.save();

    const accessToken = sendTokens(res, user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id:    user._id,
          name:  user.name,
          email: user.email,
          teams: [{ _id: defaultTeam._id, name: defaultTeam.name }],
        },
        team:        { id: defaultTeam._id, name: defaultTeam.name },
        accessToken,
      },
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email & password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('teams', 'name');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = sendTokens(res, user);

    res.json({
      success: true,
      data: {
        user: {
          id:    user._id,
          name:  user.name,
          email: user.email,
          teams: user.teams,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ─── Google Auth ──────────────────────────────────────────────────────────────
// FIX: Now uses same response shape as login + sets refresh token cookie
export const GoogleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential required' });
    }

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
    );
    if (!response.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const googleUser = await response.json();

    const configuredClientId = process.env.GOOGLE_CLIENT_ID || process.env.googleClientId;
    if (configuredClientId && googleUser.aud !== configuredClientId) {
      return res.status(401).json({ success: false, message: 'Google client ID mismatch' });
    }

    let user = await User.findOne({ googleId: googleUser.sub }).populate('teams', 'name');

    if (!user) {
      const existingUser = await User.findOne({ email: googleUser.email });
      if (existingUser) {
        existingUser.googleId = googleUser.sub;
        existingUser.provider = 'google';
        user = await existingUser.save();
        user = await User.findById(user._id).populate('teams', 'name');
      } else {
        const newUser = await User.create({
          name:     googleUser.name,
          email:    googleUser.email,
          googleId: googleUser.sub,
          provider: 'google',
        });

        // Create a default team for new Google users
        const defaultTeam = await Team.create({
          name:    `${googleUser.name}'s Team`,
          owner:   newUser._id,
          members: [{ user: newUser._id, role: 'OWNER' }],
        });
        newUser.teams.push(defaultTeam._id);
        await newUser.save();

        user = await User.findById(newUser._id).populate('teams', 'name');
      }
    }

    // FIX: Use sendTokens (sets refresh cookie + returns access token)
    // Previously was using jwt.sign directly without refresh token cookie
    const accessToken = sendTokens(res, user);

    res.json({
      success: true,
      data: {
        user: {
          id:    user._id,
          name:  user.name,
          email: user.email,
          teams: user.teams,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('GOOGLE AUTH ERROR:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(payload.id);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);

    res.json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    path:     '/api/auth/refresh',
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// ─── Logout All Devices ───────────────────────────────────────────────────────
export const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });

    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      path:     '/api/auth/refresh',
      httpOnly: true,
      secure:   isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
    });

    res.json({ success: true, message: 'Logged out from all devices' });
  } catch {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('teams', 'name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).populate('teams', 'name');

    res.json({
      success: true,
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        teams: user.teams,
      },
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
