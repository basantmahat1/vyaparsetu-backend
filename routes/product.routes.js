const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const businessMiddleware = require('../middlewares/business.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { kycCheckMiddleware } = require('../middlewares/kycCheck.middleware');

router.use(authMiddleware);
router.use(kycCheckMiddleware);
router.use(businessMiddleware);

// Products are accessible in limited mode before KYC
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// POST, PUT, DELETE require owner/manager roles (limited mode restrictions apply automatically)
router.post('/', roleMiddleware('owner', 'manager', 'super_admin'), productController.createProduct);
router.put('/:id', roleMiddleware('owner', 'manager', 'super_admin'), productController.updateProduct);
router.delete('/:id', roleMiddleware('owner', 'super_admin'), productController.deleteProduct);
router.patch('/:id/stock', roleMiddleware('owner', 'manager', 'super_admin'), productController.updateStock);

module.exports = router;