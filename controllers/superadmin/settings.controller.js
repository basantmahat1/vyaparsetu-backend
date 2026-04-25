const { SystemSettings, ActivityLog, User, Business, PaymentHistory } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// SYSTEM SETTINGS
const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll();
    
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    sendResponse(res, 200, true, 'Settings retrieved', settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    sendError(res, 500, 'Failed to get settings', error);
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    let setting = await SystemSettings.findOne({ where: { key } });
    if (!setting) {
      setting = await SystemSettings.create({ key, value, description });
    } else {
      await setting.update({ value, description });
    }

    await ActivityLog.create({
      userId: req.user.id,
      action: `Updated setting: ${key}`,
      actionType: 'update',
      resource: 'SystemSettings',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Setting updated successfully', setting);
  } catch (error) {
    console.error('Update setting error:', error);
    sendError(res, 500, 'Failed to update setting', error);
  }
};

const setMaintenanceMode = async (req, res) => {
  try {
    const { enabled } = req.body;

    await SystemSettings.upsert({
      key: 'maintenance_mode',
      value: { enabled },
      description: 'System maintenance mode'
    });

    sendResponse(res, 200, true, 'Maintenance mode updated', { enabled });
  } catch (error) {
    console.error('Set maintenance mode error:', error);
    sendError(res, 500, 'Failed to set maintenance mode', error);
  }
};

// ACTIVITY LOGS
const getActivityLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 10 } = req.query;

    const where = {};
    if (action) where.action = { [Op.like]: `%${action}%` };

    const logs = await ActivityLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Activity logs retrieved', {
      data: logs.rows,
      pagination: {
        total: logs.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(logs.count / limit)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    sendError(res, 500, 'Failed to get activity logs', error);
  }
};

// REPORTS
const exportUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    const csv = 'ID,Name,Email,Role,Active,Created\n' +
      users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.isActive},${u.createdAt}`).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    sendError(res, 500, 'Failed to export users', error);
  }
};

const exportBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll();

    const csv = 'ID,Name,Owner,Email,Status,Approved,Created\n' +
      businesses.map(b => `${b.id},${b.name},${b.ownerId},${b.email},${b.isActive ? 'Active' : 'Inactive'},${b.isApproved ? 'Yes' : 'No'},${b.createdAt}`).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=businesses.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export businesses error:', error);
    sendError(res, 500, 'Failed to export businesses', error);
  }
};

const exportRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      status: 'completed'
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await PaymentHistory.findAll({
      where,
      include: [{ model: Business, as: 'business' }],
      order: [['createdAt', 'DESC']]
    });

    const csv = 'ID,Business,Amount,Currency,Status,Payment Method,Transaction ID,Date\n' +
      payments.map(p => `${p.id},${p.business?.name || 'N/A'},${p.amount},${p.currency},${p.status},${p.paymentMethod},${p.transactionId},${p.createdAt}`).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export revenue report error:', error);
    sendError(res, 500, 'Failed to export revenue report', error);
  }
};

module.exports = {
  getSettings,
  updateSetting,
  setMaintenanceMode,
  getActivityLogs,
  exportUsers,
  exportBusinesses,
  exportRevenueReport
};