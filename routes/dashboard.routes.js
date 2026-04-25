const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const businessMiddleware = require('../middlewares/business.middleware');

router.use(authMiddleware);
router.use(businessMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/super-admin-stats', dashboardController.getSuperAdminStats);

module.exports = router;