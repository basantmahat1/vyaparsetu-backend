const { Business } = require('../models');
const { sendError } = require('../utils/response');

/**
 * KYC Status Check - Fetches business KYC info and attaches to request
 */
const kycCheckMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.businessId) {
      return next();
    }

    const business = await Business.findByPk(req.user.businessId, {
      attributes: ['id', 'kycStatus', 'isApproved', 'ownerFullName', 'panVatNumber', 'businessType']
    });

    if (business) {
      req.business = {
        id: business.id,
        kycStatus: business.kycStatus,
        isApproved: business.isApproved,
        isKycVerified: business.kycStatus === 'verified' && business.isApproved
      };
    }

    next();
  } catch (error) {
    console.error('KYC check middleware error:', error);
    next();
  }
};

/**
 * Feature-based lock middleware with soft onboarding support
 * @param {string} feature - Feature name (e.g., 'payments', 'reports', 'staff')
 * @param {object} options - Additional options { allowLimited: true, message: 'custom message' }
 */
const featureLockMiddleware = (feature, options = {}) => {
  return async (req, res, next) => {
    try {
      const business = req.business;

      if (!business) {
        return sendError(res, 401, 'Business not found');
      }

      const featureAccess = getFeatureAccess(business.kycStatus, business.isApproved);
      const access = featureAccess[feature];

      if (!access) {
        // Feature doesn't exist, allow access
        return next();
      }

      // If feature is locked and KYC not verified
      if (access.locked && !business.isKycVerified) {
        // If allowLimited is true and mode is 'limited', allow access but mark as limited
        if (options.allowLimited && access.mode === 'limited') {
          req.featureMode = 'limited';
          req.featureLocked = false;
          return next();
        }

        return res.status(403).json({
          success: false,
          locked: true,
          feature,
          message: options.message || `${feature} is locked. Please complete KYC verification.`,
          kycStatus: business.kycStatus,
          redirectTo: '/owner/dashboard?view=kyc'
        });
      }

      // Set feature mode in request
      req.featureMode = access.mode || 'full';
      req.featureMaxItems = access.maxItems;
      req.featureLocked = false;

      next();
    } catch (error) {
      console.error('Feature lock middleware error:', error);
      sendError(res, 500, 'Server error');
    }
  };
};

/**
 * Get feature access permissions based on KYC status
 * Returns comprehensive feature access matrix
 */
const getFeatureAccess = (kycStatus, isApproved) => {
  const isVerified = kycStatus === 'verified' && isApproved;

  return {
    // 🟢 Soft Onboarding - Always accessible
    dashboard: {
      locked: false,
      mode: isVerified ? 'full' : 'basic',
      description: 'Dashboard access'
    },
    products: {
      locked: false,
      mode: 'limited',
      maxItems: isVerified ? Infinity : 50,
      description: 'Product management (limited to 50 before KYC)'
    },
    sales: {
      locked: false,
      mode: isVerified ? 'full' : 'limited',
      description: 'Sales/Orders tracking'
    },
    customers: {
      locked: false,
      mode: isVerified ? 'full' : 'limited',
      description: 'Customer management'
    },
    inventory: {
      locked: false,
      mode: isVerified ? 'full' : 'limited',
      maxItems: isVerified ? Infinity : 50,
      description: 'Inventory tracking'
    },
    pos_interface: {
      locked: false,
      mode: 'limited',
      description: 'POS system (test mode before KYC)'
    },

    // 🟡 Limited access - some features work, some locked
    analytics: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Analytics and insights'
    },

    // 🔴 Fully locked until KYC verified
    payments: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Payment gateway integration'
    },
    reports: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Business reports'
    },
    staff: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Staff management system'
    },
    online_store: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Online store publishing'
    },
    api_access: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'API access and integration'
    },
    bulk_upload: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Bulk product upload'
    },
    advanced_analytics: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Advanced analytics and reports'
    },
    recurring_payments: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Recurring payment setup'
    },
    integrations: {
      locked: !isVerified,
      mode: isVerified ? 'full' : 'none',
      description: 'Third-party integrations'
    }
  };
};

/**
 * Check if a feature is accessible for a given KYC status
 */
const isFeatureAccessible = (feature, kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  const featureAccess = access[feature];
  return featureAccess ? !featureAccess.locked : true;
};

/**
 * Get feature access info for a specific feature
 */
const getFeatureInfo = (feature, kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  return access[feature] || null;
};

module.exports = {
  kycCheckMiddleware,
  featureLockMiddleware,
  getFeatureAccess,
  isFeatureAccessible,
  getFeatureInfo
};
