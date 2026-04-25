const router = require('express').Router();
const businessController = require('../controllers/business.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All business routes require authentication
router.use(authMiddleware);

// Only super admin can manage all businesses
router.get('/', roleMiddleware('super_admin'), businessController.getBusinesses);
router.post('/', roleMiddleware('super_admin'), businessController.createBusiness);
router.get('/:id', roleMiddleware('super_admin', 'owner'), businessController.getBusinessById);
router.put('/:id', roleMiddleware('super_admin', 'owner'), businessController.updateBusiness);
router.delete('/:id', roleMiddleware('super_admin'), businessController.deleteBusiness);
router.get('/:id/stats', roleMiddleware('super_admin', 'owner'), businessController.getBusinessStats);

module.exports = router;