import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { generateTokens } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and organization name are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Generate unique slug for organization
    const baseSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';
    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const organization = await Organization.create({
      name: organizationName.trim(),
      slug,
      voiceProvider: config.voiceProvider || 'mock'
    });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      organizationId: organization._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'admin'
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          voiceProvider: organization.voiceProvider
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const organization = await Organization.findById(user.organizationId);

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    // Keep at most 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          voiceProvider: organization.voiceProvider
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokenRecord = user.refreshTokens.find(t => t.token === token && t.expiresAt > new Date());
    if (!tokenRecord) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or revoked' });
    }

    const tokens = generateTokens(user);
    tokenRecord.token = tokens.refreshToken;
    await user.save();

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      },
      organization: {
        id: req.org._id,
        name: req.org.name,
        slug: req.org.slug,
        voiceProvider: req.org.voiceProvider,
        providerConfig: {
          sarvamConfigured: !!(req.org.providerConfig?.sarvamApiKey || config.sarvamApiKey),
          telephonyNumber: req.org.providerConfig?.telephonyNumber || '+91 800-SAHARA-VOICE'
        },
        timezone: req.org.timezone,
        callingHours: req.org.callingHours
      }
    }
  });
};

export const logout = async (req, res) => {
  if (req.user && req.body.refreshToken) {
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== req.body.refreshToken);
    await req.user.save();
  }
  return res.json({ success: true, message: 'Logged out successfully' });
};
