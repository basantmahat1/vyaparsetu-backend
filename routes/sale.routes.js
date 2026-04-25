const router = require('express').Router();
const saleController = require('../controllers/sale.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const businessMiddleware = require('../middlewares/business.middleware');

router.use(authMiddleware);
router.use(businessMiddleware);

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);
router.get('/:id', saleController.getSaleById);

module.exports = router;