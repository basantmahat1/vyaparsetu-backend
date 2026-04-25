const { Sale, SaleItem, Product, Customer, User, sequelize } = require('../models');
const { sendResponse, sendError } = require('../utils/response');

const createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, customerId, paymentMethod, discount, notes } = req.body;
    const businessId = req.businessId || req.body.businessId;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return sendError(res, 400, 'No items in sale');
    }

    let subtotal = 0;
    const processedItems = [];

    // Process each item and check stock
    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.productId, businessId },
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return sendError(res, 404, `Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return sendError(res, 400, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });

      // Update stock
      await product.update({ 
        stock: product.stock - item.quantity 
      }, { transaction });
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - (discount || 0);

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create sale
    const sale = await Sale.create({
      invoiceNumber,
      subtotal,
      tax,
      discount: discount || 0,
      total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      businessId,
      userId,
      customerId: customerId || null,
      notes
    }, { transaction });

    // Create sale items
    for (const item of processedItems) {
      await SaleItem.create({
        ...item,
        saleId: sale.id
      }, { transaction });
    }

    // Update customer total spent if customer exists
    if (customerId) {
      const customer = await Customer.findByPk(customerId, { transaction });
      if (customer) {
        await customer.update({
          totalSpent: parseFloat(customer.totalSpent) + total
        }, { transaction });
      }
    }

    await transaction.commit();

    // Fetch complete sale with items
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    sendResponse(res, 201, true, 'Sale completed successfully', completeSale);
  } catch (error) {
    await transaction.rollback();
    console.error('Create sale error:', error);
    sendError(res, 500, 'Failed to create sale', error);
  }
};

const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const businessId = req.businessId || req.query.businessId;

    if (!businessId && req.user.role !== 'super_admin') {
      return sendError(res, 403, 'Business ID required');
    }

    let whereClause = { businessId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Sale.findAndCountAll({
      where: whereClause,
      include: [
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Sales retrieved', {
      sales: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get sales error:', error);
    sendError(res, 500, 'Failed to get sales', error);
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId || req.query.businessId;

    const sale = await Sale.findOne({
      where: { id, businessId },
      include: [
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!sale) {
      return sendError(res, 404, 'Sale not found');
    }

    sendResponse(res, 200, true, 'Sale retrieved', sale);
  } catch (error) {
    sendError(res, 500, 'Failed to get sale', error);
  }
};

module.exports = { createSale, getSales, getSaleById };