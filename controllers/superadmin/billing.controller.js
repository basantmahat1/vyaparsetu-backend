const { PaymentHistory, Business, Subscription, ActivityLog, sequelize } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');

// BILLING & REVENUE
const getRevenueOverview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter;
    if (period === 'day') {
      dateFilter = { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { [Op.gte]: weekAgo };
    } else {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { [Op.gte]: monthAgo };
    }

    const totalRevenue = await PaymentHistory.sum('amount', {
      where: {
        status: 'completed',
        createdAt: dateFilter
      }
    }) || 0;

    const completedPayments = await PaymentHistory.count({
      where: {
        status: 'completed',
        createdAt: dateFilter
      }
    });

    const failedPayments = await PaymentHistory.count({
      where: {
        status: 'failed',
        createdAt: dateFilter
      }
    });

    const refundedAmount = await PaymentHistory.sum('amount', {
      where: {
        status: 'refunded',
        createdAt: dateFilter
      }
    }) || 0;

    sendResponse(res, 200, true, 'Revenue overview retrieved', {
      totalRevenue,
      completedPayments,
      failedPayments,
      refundedAmount,
      period
    });
  } catch (error) {
    console.error('Get revenue overview error:', error);
    sendError(res, 500, 'Failed to get revenue overview', error);
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const payments = await PaymentHistory.findAndCountAll({
      where,
      include: [
        { model: Business, as: 'business' },
        { model: Subscription, as: 'subscription' }
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Payment history retrieved', {
      data: payments.rows,
      pagination: {
        total: payments.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    sendError(res, 500, 'Failed to get payment history', error);
  }
};

const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentHistory.findByPk(paymentId);
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    await payment.update({ status: 'refunded' });

    await ActivityLog.create({
      userId: req.user.id,
      businessId: payment.businessId,
      action: `Refunded payment: ${reason || 'Manual refund'}`,
      actionType: 'update',
      resource: 'Payment',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Payment refunded successfully', payment);
  } catch (error) {
    console.error('Refund payment error:', error);
    sendError(res, 500, 'Failed to refund payment', error);
  }
};

module.exports = {
  getRevenueOverview,
  getPaymentHistory,
  refundPayment
};