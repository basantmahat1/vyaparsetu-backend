const { sendError } = require('../utils/response');

const businessMiddleware = (req, res, next) => {
  try {
    // Super admin can access all businesses
    if (req.user?.role === 'super_admin') {
      // For super admin, businessId comes from query or body
      req.query.businessId = req.query.businessId || req.body.businessId;
      return next();
    }

    // For other roles, enforce their businessId
    if (!req.user?.businessId) {
      return sendError(res, 403, 'No business associated with this user');
    }

    // Inject businessId into request
    req.businessId = req.user.businessId;
    req.query.businessId = req.user.businessId;
    req.body.businessId = req.user.businessId;

    next();
  } catch (error) {
    console.error('Business middleware error:', error);
    sendError(res, 500, 'Server error');
  }
};

module.exports = businessMiddleware;