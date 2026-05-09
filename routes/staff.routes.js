const router = require('express').Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { kycCheckMiddleware, featureLockMiddleware } = require('../middlewares/kycCheck.middleware');

router.use(authMiddleware);
router.use(kycCheckMiddleware);
router.use(roleMiddleware('owner')); // Only owners can manage staff accounts
router.use(featureLockMiddleware('staff', { message: 'Staff management is locked. Please complete KYC verification.' }));

router.get('/', staffController.getStaff);
router.post('/', staffController.createStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;