const { Product, Sale, SaleItem, sequelize, Business, User } = require('../models');
const { sendResponse, sendError } = require('../utils/response');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const businessId = req.businessId || req.query.businessId;
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!businessId && !isSuperAdmin) {
      return sendError(res, 403, 'Business ID required');
    }

    // For super admin, get global stats, otherwise business-specific
    const whereCondition = isSuperAdmin ? {} : { businessId };

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total sales today
    const todaySales = await Sale.sum('total', {
      where: {
        ...whereCondition,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Total products
    const totalProducts = await Product.count({ where: whereCondition });

    // Low stock products (stock < lowStockThreshold)
    const lowStockProducts = await Product.count({
      where: {
        ...whereCondition,
        [Op.and]: sequelize.literal('stock < low_stock_threshold')
      }
    });

    // Recent sales
    const recentSales = await Sale.findAll({
      where: whereCondition,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: ['items', 'customer', 'user']
    });

    // Top selling products
    const topProducts = await SaleItem.findAll({
      include: [{
        model: Product,
        as: 'product',
        where: whereCondition,
        required: true
      }],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      group: ['productId', 'product.id'],
      order: [[sequelize.literal('totalQuantity'), 'DESC']],
      limit: 5
    });

    // Sales by payment method
    const salesByPayment = await Sale.findAll({
      where: whereCondition,
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['paymentMethod']
    });

    sendResponse(res, 200, true, 'Dashboard stats retrieved', {
      todaySales: todaySales || 0,
      totalProducts,
      lowStockProducts,
      recentSales,
      topProducts,
      salesByPayment
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    sendError(res, 500, 'Failed to get dashboard stats', error);
  }
};

const getSuperAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return sendError(res, 403, 'Access denied');
    }

    // Total businesses
    const totalBusinesses = await Business.count();

    // Total users
    const totalUsers = await User.count();

    // Total products across all businesses
    const totalProducts = await Product.count();

    // Total sales across all businesses
    const totalSales = await Sale.count();

    // Today's sales across all businesses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.sum('total', {
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    sendResponse(res, 200, true, 'Super admin stats retrieved', {
      totalBusinesses,
      totalUsers,
      totalProducts,
      totalSales,
      todaySales: todaySales || 0
    });
  } catch (error) {
    console.error('Get super admin stats error:', error);
    sendError(res, 500, 'Failed to get super admin stats', error);
  }
};

module.exports = { getDashboardStats, getSuperAdminStats };