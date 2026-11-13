import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, orgId: user.organizationId, role: user.role },
    config.jwtSecret,
    { expiresIn: '2h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid or user not found.'
      });
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      return res.status(403).json({
        success: false,
        message: 'Organization not found or inactive.'
      });
    }

    req.user = user;
    req.org = organization;
    req.orgId = user.organizationId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};
