const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendError(res, 401, 'No token provided');
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 401, 'Invalid token');
    }

    // Check if user exists
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return sendError(res, 401, 'User not found');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'User account is disabled');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    sendError(res, 500, 'Server error');
  }
};

module.exports = authMiddleware;