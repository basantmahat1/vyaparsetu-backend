const router = require('express').Router();
const kycStatusController = require('../controllers/kycStatus.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { kycCheckMiddleware } = require('../middlewares/kycCheck.middleware');

// Apply KYC check to all routes
router.use(authMiddleware);
router.use(kycCheckMiddleware);

// Get KYC status and feature access
router.get('/status', kycStatusController.getKycStatus);

// Get dashboard overview
router.get('/overview', kycStatusController.getDashboardOverview);

module.exports = router;
