const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const businessMiddleware = require('../middlewares/business.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);
router.use(businessMiddleware);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', roleMiddleware('owner', 'manager', 'super_admin'), productController.createProduct);
router.put('/:id', roleMiddleware('owner', 'manager', 'super_admin'), productController.updateProduct);
router.delete('/:id', roleMiddleware('owner', 'super_admin'), productController.deleteProduct);
router.patch('/:id/stock', roleMiddleware('owner', 'manager', 'super_admin'), productController.updateStock);

module.exports = router;