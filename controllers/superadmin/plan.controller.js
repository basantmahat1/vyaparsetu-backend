const { Plan, Subscription, Business, PaymentHistory, ActivityLog } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');

// PLAN MANAGEMENT
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['price', 'ASC']]
    });

    sendResponse(res, 200, true, 'Plans retrieved', plans);
  } catch (error) {
    console.error('Get plans error:', error);
    sendError(res, 500, 'Failed to get plans', error);
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, price, description, maxStaff, maxBranches, storageGB, features } = req.body;

    const plan = await Plan.create({
      name,
      price,
      description,
      maxStaff,
      maxBranches,
      storageGB,
      features
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Created plan: ${name}`,
      actionType: 'create',
      resource: 'Plan',
      status: 'success'
    });

    sendResponse(res, 201, true, 'Plan created successfully', plan);
  } catch (error) {
    console.error('Create plan error:', error);
    sendError(res, 500, 'Failed to create plan', error);
  }
};

const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, price, description, maxStaff, maxBranches, storageGB, features, isActive } = req.body;

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    await plan.update({
      name: name || plan.name,
      price: price !== undefined ? price : plan.price,
      description: description || plan.description,
      maxStaff: maxStaff || plan.maxStaff,
      maxBranches: maxBranches || plan.maxBranches,
      storageGB: storageGB || plan.storageGB,
      features: features || plan.features,
      isActive: isActive !== undefined ? isActive : plan.isActive
    });

    sendResponse(res, 200, true, 'Plan updated successfully', plan);
  } catch (error) {
    console.error('Update plan error:', error);
    sendError(res, 500, 'Failed to update plan', error);
  }
};

// SUBSCRIPTION MANAGEMENT
const assignPlanToBusinesses = async (req, res) => {
  try {
    const { businessIds, planId } = req.body;

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    for (const businessId of businessIds) {
      const business = await Business.findByPk(businessId);
      if (!business) continue;

      // Cancel old subscription if exists
      await Subscription.update(
        { status: 'cancelled' },
        { where: { businessId, status: 'active' } }
      );

      // Create new subscription
      await Subscription.create({
        businessId,
        planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await ActivityLog.create({
        userId: req.user.id,
        businessId,
        action: `Assigned plan: ${plan.name}`,
        actionType: 'update',
        resource: 'Subscription',
        status: 'success'
      });
    }

    sendResponse(res, 200, true, 'Plan assigned to businesses successfully');
  } catch (error) {
    console.error('Assign plan error:', error);
    sendError(res, 500, 'Failed to assign plan', error);
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const subscriptions = await Subscription.findAndCountAll({
      where,
      include: [
        { model: Business, as: 'business' },
        { model: Plan, as: 'plan' }
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Subscriptions retrieved', {
      data: subscriptions.rows,
      pagination: {
        total: subscriptions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(subscriptions.count / limit)
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    sendError(res, 500, 'Failed to get subscriptions', error);
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return sendError(res, 404, 'Subscription not found');
    }

    await subscription.update({ status: 'cancelled' });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: subscription.businessId,
      action: 'Cancelled subscription',
      actionType: 'update',
      resource: 'Subscription',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Subscription cancelled successfully');
  } catch (error) {
    console.error('Cancel subscription error:', error);
    sendError(res, 500, 'Failed to cancel subscription', error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  assignPlanToBusinesses,
  getSubscriptions,
  cancelSubscription
};