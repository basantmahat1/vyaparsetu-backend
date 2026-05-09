/**
 * KYC Permissions Utility
 * Provides comprehensive permission checking and validation for KYC-based features
 */

const { getFeatureAccess } = require('../middlewares/kycCheck.middleware');

/**
 * Get all locked features for a business
 */
const getLockedFeatures = (kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  return Object.entries(access)
    .filter(([_, feature]) => feature.locked)
    .map(([name, feature]) => ({
      name,
      ...feature
    }));
};

/**
 * Get all unlocked features for a business
 */
const getUnlockedFeatures = (kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  return Object.entries(access)
    .filter(([_, feature]) => !feature.locked)
    .map(([name, feature]) => ({
      name,
      ...feature
    }));
};

/**
 * Get features in limited mode (requires soft onboarding check)
 */
const getLimitedFeatures = (kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  return Object.entries(access)
    .filter(([_, feature]) => feature.mode === 'limited' && !feature.locked)
    .map(([name, feature]) => ({
      name,
      ...feature
    }));
};

/**
 * Apply feature mode restrictions to results
 */
const applyFeatureRestrictions = (items, feature, kycStatus, isApproved) => {
  const access = getFeatureAccess(kycStatus, isApproved);
  const featureAccess = access[feature];

  if (!featureAccess || featureAccess.locked) {
    return [];
  }

  // Apply item limit if in limited mode
  if (featureAccess.maxItems && items.length > featureAccess.maxItems) {
    return items.slice(0, featureAccess.maxItems);
  }

  return items;
};

/**
 * Build KYC progress message
 */
const buildKycProgressMessage = (completedFields, totalFields, kycStatus) => {
  const percentage = Math.round((completedFields / totalFields) * 100);

  if (percentage === 100 && kycStatus === 'pending') {
    return 'All documents submitted. Awaiting verification...';
  }

  if (kycStatus === 'verified') {
    return 'Account verified! All features unlocked.';
  }

  if (kycStatus === 'rejected') {
    return 'KYC verification rejected. Please resubmit your documents.';
  }

  const remainingSteps = totalFields - completedFields;
  return `Complete ${remainingSteps} more step${remainingSteps > 1 ? 's' : ''} to unlock full features.`;
};

/**
 * Get feature unlock timeline
 */
const getFeatureUnlockTimeline = (kycStatus, isApproved) => {
  const isVerified = kycStatus === 'verified' && isApproved;

  return {
    phase1_exploration: {
      name: 'Exploration Mode (Current)',
      features: ['dashboard', 'products', 'sales', 'customers', 'inventory', 'pos_interface'],
      locked: false,
      icon: '🟢'
    },
    phase2_pending: {
      name: 'KYC Verification Pending',
      features: ['analytics', 'reports', 'payments', 'staff', 'online_store', 'api_access'],
      locked: !isVerified,
      icon: isVerified ? '🟢' : '🔴'
    },
    phase3_verified: {
      name: 'Full Access Unlocked',
      features: ['bulk_upload', 'advanced_analytics', 'recurring_payments', 'integrations'],
      locked: !isVerified,
      icon: isVerified ? '🟢' : '🔴'
    }
  };
};

/**
 * Calculate KYC completion score
 */
const calculateKycScore = (kycFields) => {
  const completedCount = Object.values(kycFields).filter(Boolean).length;
  const totalCount = Object.keys(kycFields).length;
  return Math.round((completedCount / totalCount) * 100);
};

/**
 * Get next required KYC step
 */
const getNextKycStep = (kycFields) => {
  const steps = [
    { name: 'fullName', label: 'Full Name', field: 'ownerFullName' },
    { name: 'businessType', label: 'Business Type', field: 'businessType' },
    { name: 'panVat', label: 'PAN/VAT Number', field: 'panVatNumber' },
    { name: 'address', label: 'Address', field: 'ownerProvince' },
    { name: 'idFront', label: 'ID Front Copy', field: 'idFrontUrl' },
    { name: 'idBack', label: 'ID Back Copy', field: 'idBackUrl' },
    { name: 'selfie', label: 'Selfie with ID', field: 'selfieUrl' },
    { name: 'panCert', label: 'PAN/VAT Certificate', field: 'panVatCertUrl' }
  ];

  for (const step of steps) {
    if (!kycFields[step.name]) {
      return step;
    }
  }

  return null;
};

/**
 * Validate access for critical operations
 */
const validateCriticalOperationAccess = (operation, kycStatus, isApproved) => {
  const criticalOps = {
    process_payment: !(['verified'].includes(kycStatus) && isApproved),
    publish_store: !(['verified'].includes(kycStatus) && isApproved),
    manage_staff: !(['verified'].includes(kycStatus) && isApproved),
    access_reports: !(['verified'].includes(kycStatus) && isApproved),
    api_integration: !(['verified'].includes(kycStatus) && isApproved)
  };

  return {
    allowed: !criticalOps[operation],
    message: !criticalOps[operation] 
      ? `${operation} is available`
      : `${operation} requires KYC verification. Please complete your KYC.`
  };
};

module.exports = {
  getLockedFeatures,
  getUnlockedFeatures,
  getLimitedFeatures,
  applyFeatureRestrictions,
  buildKycProgressMessage,
  getFeatureUnlockTimeline,
  calculateKycScore,
  getNextKycStep,
  validateCriticalOperationAccess
};
