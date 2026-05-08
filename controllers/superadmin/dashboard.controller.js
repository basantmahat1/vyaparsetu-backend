const { Business, User, Plan, Subscription, PaymentHistory, ActivityLog, SupportTicket, SystemSettings, Product, sequelize } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');

// DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return sendError(res, 403, 'Access denied');
    }

    const totalBusinesses = await Business.count();
    const activeBusinesses = await Business.count({ where: { isActive: true } });
    const inactiveBusinesses = totalBusinesses - activeBusinesses;
    
    const totalUsers = await User.count();
    const todaySignups = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Today's revenue
    const todayRevenue = await PaymentHistory.sum('amount', {
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }) || 0;

    // Pending approvals (new businesses not approved)
    const pendingApprovals = await Business.count({
      where: { isApproved: false }
    });

    sendResponse(res, 200, true, 'Dashboard stats retrieved', {
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      totalUsers,
      todaySignups,
      todayRevenue,
      pendingApprovals,
      systemStatus: 'operational'
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    sendError(res, 500, 'Failed to get dashboard stats', error);
  }
};

// BUSINESS MANAGEMENT
const getBusinesses = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (status) {
      if (status === 'active') where.isActive = true;
      else if (status === 'inactive') where.isActive = false;
      else if (status === 'pending') where.isApproved = false;
      else if (status === 'kyc_pending') where.kycStatus = 'pending';
    }
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const businesses = await Business.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'email', 'role']
      }, {
        model: Subscription,
        as: 'subscription',
        include: [{ model: Plan, as: 'plan' }]
      }],
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Businesses retrieved', {
      data: businesses.rows,
      pagination: {
        total: businesses.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(businesses.count / limit)
      }
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    sendError(res, 500, 'Failed to get businesses', error);
  }
};

const approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({ isApproved: true });
    
    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Approved business',
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business approved successfully', business);
  } catch (error) {
    console.error('Approve business error:', error);
    sendError(res, 500, 'Failed to approve business', error);
  }
};

const rejectBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { reason } = req.body;
    
    const business = await Business.findByPk(businessId);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({ isApproved: false, rejectionReason: reason });
    
    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: `Rejected business: ${reason}`,
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business rejected successfully', business);
  } catch (error) {
    console.error('Reject business error:', error);
    sendError(res, 500, 'Failed to reject business', error);
  }
};

const suspendBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({ isActive: false });
    
    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Suspended business',
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business suspended successfully', business);
  } catch (error) {
    console.error('Suspend business error:', error);
    sendError(res, 500, 'Failed to suspend business', error);
  }
};

const reactivateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({ isActive: true });
    
    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Reactivated business',
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business reactivated successfully', business);
  } catch (error) {
    console.error('Reactivate business error:', error);
    sendError(res, 500, 'Failed to reactivate business', error);
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByPk(businessId);
    
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.destroy();
    
    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Deleted business',
      actionType: 'delete',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business deleted successfully');
  } catch (error) {
    console.error('Delete business error:', error);
    sendError(res, 500, 'Failed to delete business', error);
  }
};

const updateBusinessDetails = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category, kycStatus, maxStaff, maxBranches, storageGB } = req.body;

    const business = await Business.findByPk(businessId);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({
      category: category || business.category,
      kycStatus: kycStatus || business.kycStatus,
      maxStaff: maxStaff !== undefined ? maxStaff : business.maxStaff,
      maxBranches: maxBranches !== undefined ? maxBranches : business.maxBranches,
      storageGB: storageGB !== undefined ? storageGB : business.storageGB
    });

    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Updated business details/limits',
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Business details updated successfully', business);
  } catch (error) {
    console.error('Update business details error:', error);
    sendError(res, 500, 'Failed to update business details', error);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, businessId, flagged, blocked } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition.name = { [Op.iLike]: `%${search}%` };
    }
    if (businessId) {
      whereCondition.businessId = businessId;
    }
    if (flagged !== undefined) {
      whereCondition.flagged = flagged === 'true';
    }
    if (blocked !== undefined) {
      whereCondition.blocked = blocked === 'true';
    }

    const { rows: products, count } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Products retrieved successfully', {
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    sendError(res, 500, 'Failed to retrieve products', error);
  }
};

const flagProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.update({
      flagged: true,
      flagReason: reason,
      flaggedAt: new Date(),
      flaggedBy: req.user.id
    });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: product.businessId,
      action: `Flagged product: ${product.name}`,
      actionType: 'update',
      resource: 'Product',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Product flagged successfully', product);
  } catch (error) {
    console.error('Flag product error:', error);
    sendError(res, 500, 'Failed to flag product', error);
  }
};

const unflagProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.update({
      flagged: false,
      flagReason: null,
      flaggedAt: null,
      flaggedBy: null
    });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: product.businessId,
      action: `Unflagged product: ${product.name}`,
      actionType: 'update',
      resource: 'Product',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Product unflagged successfully', product);
  } catch (error) {
    console.error('Unflag product error:', error);
    sendError(res, 500, 'Failed to unflag product', error);
  }
};

const blockProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.update({
      blocked: true,
      blockReason: reason,
      blockedAt: new Date(),
      blockedBy: req.user.id
    });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: product.businessId,
      action: `Blocked product: ${product.name}`,
      actionType: 'update',
      resource: 'Product',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Product blocked successfully', product);
  } catch (error) {
    console.error('Block product error:', error);
    sendError(res, 500, 'Failed to block product', error);
  }
};

const unblockProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.update({
      blocked: false,
      blockReason: null,
      blockedAt: null,
      blockedBy: null
    });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: product.businessId,
      action: `Unblocked product: ${product.name}`,
      actionType: 'update',
      resource: 'Product',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Product unblocked successfully', product);
  } catch (error) {
    console.error('Unblock product error:', error);
    sendError(res, 500, 'Failed to unblock product', error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: [{ model: Business, as: 'business' }]
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.destroy();

    await ActivityLog.create({
      userId: req.user.id,
      businessId: product.businessId,
      action: `Deleted product: ${product.name}`,
      actionType: 'delete',
      resource: 'Product',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    sendError(res, 500, 'Failed to delete product', error);
  }
};

const getAIInsights = async (req, res) => {
  try {
    // Get business growth insights
    const businessGrowth = await Business.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Get top performing businesses
    const topBusinesses = await Business.findAll({
      include: [
        {
          model: Sale,
          as: 'sales',
          attributes: [],
          where: {
            createdAt: {
              [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
            }
          },
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('sales.total')), 0), 'totalRevenue']
      ],
      group: ['Business.id', 'Business.name'],
      order: [[sequelize.literal('totalRevenue'), 'DESC']],
      limit: 10
    });

    // Get product trends
    const productTrends = await Product.findAll({
      include: [
        {
          model: SaleItem,
          as: 'saleItems',
          attributes: [],
          where: {
            createdAt: {
              [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 7 DAY)')
            }
          },
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('saleItems.quantity')), 0), 'totalSold']
      ],
      group: ['Product.id', 'Product.name'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: 10
    });

    sendResponse(res, 200, true, 'AI insights retrieved successfully', {
      businessGrowth,
      topBusinesses,
      productTrends,
      recommendations: [
        'Consider increasing server capacity for peak hours',
        'Promote top-selling products more aggressively',
        'Review businesses with declining sales'
      ]
    });
  } catch (error) {
    console.error('Get AI insights error:', error);
    sendError(res, 500, 'Failed to retrieve AI insights', error);
  }
};

const scanProductsForIssues = async (req, res) => {
  try {
    // Find products with suspicious prices
    const suspiciousProducts = await Product.findAll({
      where: {
        price: {
          [Op.lt]: 10 // Products under ₹10 might be suspicious
        }
      },
      include: [{ model: Business, as: 'business' }],
      limit: 50
    });

    // Find products with no sales in 30 days
    const stagnantProducts = await Product.findAll({
      include: [
        {
          model: SaleItem,
          as: 'saleItems',
          where: {
            createdAt: {
              [Op.lt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
            }
          },
          required: false
        },
        { model: Business, as: 'business' }
      ],
      where: {
        [Op.or]: [
          { '$saleItems.id$': null },
          sequelize.literal('saleItems.createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)')
        ]
      },
      limit: 50
    });

    // Find duplicate products
    const duplicateProducts = await sequelize.query(`
      SELECT name, COUNT(*) as count
      FROM products
      GROUP BY name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });

    sendResponse(res, 200, true, 'Product scan completed', {
      suspiciousProducts,
      stagnantProducts,
      duplicateProducts,
      totalIssues: suspiciousProducts.length + stagnantProducts.length + duplicateProducts.length
    });
  } catch (error) {
    console.error('Scan products error:', error);
    sendError(res, 500, 'Failed to scan products', error);
  }
};

module.exports = {
  getDashboardStats,
  getBusinesses,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  reactivateBusiness,
  deleteBusiness,
  updateBusinessDetails,
  getAllProducts,
  flagProduct,
  unflagProduct,
  blockProduct,
  unblockProduct,
  deleteProduct,
  getAIInsights,
  scanProductsForIssues
};