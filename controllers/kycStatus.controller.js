const { Business } = require('../models');
const { sendResponse, sendError } = require('../utils/response');
const { getFeatureAccess } = require('../middlewares/kycCheck.middleware');

/**
 * Get KYC Status and Feature Access
 * Used by frontend to determine what's locked/unlocked
 */
const getKycStatus = async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return sendError(res, 400, 'Business ID not found');
    }

    const business = await Business.findByPk(businessId, {
      attributes: ['id', 'kycStatus', 'isApproved', 'ownerFullName', 'panVatNumber', 'businessType', 'ownerProvince', 'ownerCity', 'idFrontUrl', 'idBackUrl', 'selfieUrl', 'panVatCertUrl']
    });

    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    const isVerified = business.kycStatus === 'verified' && business.isApproved;
    const features = getFeatureAccess(business.kycStatus, business.isApproved);

    // Calculate KYC completion percentage
    const kycFields = {
      fullName: !!business.ownerFullName,
      panVat: !!business.panVatNumber,
      businessType: !!business.businessType,
      address: !!business.ownerProvince,
      idFront: !!business.idFrontUrl,
      idBack: !!business.idBackUrl,
      selfie: !!business.selfieUrl,
      panCert: !!business.panVatCertUrl
    };

    const completedFields = Object.values(kycFields).filter(Boolean).length;
    const kycProgress = Math.round((completedFields / Object.keys(kycFields).length) * 100);

    sendResponse(res, 200, true, 'KYC status retrieved', {
      kycStatus: business.kycStatus,
      isApproved: business.isApproved,
      isVerified,
      features,
      progress: {
        percentage: kycProgress,
        completed: completedFields,
        total: Object.keys(kycFields).length,
        fields: kycFields
      },
      message: isVerified ? 'Account verified! All features unlocked.' : `KYC verification pending. ${completedFields} of ${Object.keys(kycFields).length} steps completed.`
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    sendError(res, 500, 'Failed to get KYC status', error.message);
  }
};

/**
 * Get Dashboard Overview with KYC Status
 */
const getDashboardOverview = async (req, res) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return sendError(res, 400, 'Business ID not found');
    }

    const business = await Business.findByPk(businessId, {
      attributes: ['id', 'name', 'kycStatus', 'isApproved', 'plan', 'email', 'phone']
    });

    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    const isVerified = business.kycStatus === 'verified' && business.isApproved;
    const features = getFeatureAccess(business.kycStatus, business.isApproved);

    sendResponse(res, 200, true, 'Dashboard overview retrieved', {
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        plan: business.plan,
        kycStatus: business.kycStatus,
        isVerified
      },
      features,
      mode: isVerified ? 'full' : 'limited'
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    sendError(res, 500, 'Failed to get dashboard overview', error.message);
  }
};

module.exports = {
  getKycStatus,
  getDashboardOverview
};
