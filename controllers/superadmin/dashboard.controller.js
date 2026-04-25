const { Business, User, Plan, Subscription, PaymentHistory, ActivityLog, SupportTicket, SystemSettings, sequelize } = require('../../models');
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
    if (status) where.isActive = status === 'active';
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

module.exports = {
  getDashboardStats,
  getBusinesses,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  reactivateBusiness,
  deleteBusiness,
  updateBusinessDetails
};