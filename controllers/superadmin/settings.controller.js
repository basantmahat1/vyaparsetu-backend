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

// THEME MANAGEMENT
const getThemes = async (req, res) => {
  try {
    const themes = await SystemSettings.findAll({
      where: { key: { [Op.like]: 'theme_%' } },
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Themes retrieved successfully', { themes });
  } catch (error) {
    console.error('Get themes error:', error);
    sendError(res, 500, 'Failed to retrieve themes', error);
  }
};

const createTheme = async (req, res) => {
  try {
    const { name, colors, layout, category } = req.body;

    const theme = await SystemSettings.create({
      key: `theme_${name.toLowerCase().replace(/\s+/g, '_')}`,
      value: { name, colors, layout, category },
      description: `Theme: ${name}`
    });

    sendResponse(res, 201, true, 'Theme created successfully', { theme });
  } catch (error) {
    console.error('Create theme error:', error);
    sendError(res, 500, 'Failed to create theme', error);
  }
};

const updateTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const { name, colors, layout, category } = req.body;

    const theme = await SystemSettings.findByPk(themeId);
    if (!theme) {
      return sendError(res, 404, 'Theme not found');
    }

    await theme.update({
      value: { name, colors, layout, category },
      description: `Theme: ${name}`
    });

    sendResponse(res, 200, true, 'Theme updated successfully', { theme });
  } catch (error) {
    console.error('Update theme error:', error);
    sendError(res, 500, 'Failed to update theme', error);
  }
};

const assignThemeToBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { themeId } = req.body;

    const business = await Business.findByPk(businessId);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update({ themeId });

    await ActivityLog.create({
      userId: req.user.id,
      businessId,
      action: 'Assigned theme to business',
      actionType: 'update',
      resource: 'Business',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Theme assigned to business successfully');
  } catch (error) {
    console.error('Assign theme error:', error);
    sendError(res, 500, 'Failed to assign theme', error);
  }
};

// CAMPAIGN MANAGEMENT
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await SystemSettings.findAll({
      where: { key: { [Op.like]: 'campaign_%' } },
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Campaigns retrieved successfully', { campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    sendError(res, 500, 'Failed to retrieve campaigns', error);
  }
};

const createCampaign = async (req, res) => {
  try {
    const { name, type, description, discount, startDate, endDate, targetBusinesses } = req.body;

    const campaign = await SystemSettings.create({
      key: `campaign_${name.toLowerCase().replace(/\s+/g, '_')}`,
      value: { name, type, description, discount, startDate, endDate, targetBusinesses, status: 'draft' },
      description: `Campaign: ${name}`
    });

    sendResponse(res, 201, true, 'Campaign created successfully', { campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    sendError(res, 500, 'Failed to create campaign', error);
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updates = req.body;

    const campaign = await SystemSettings.findByPk(campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    await campaign.update({
      value: { ...campaign.value, ...updates },
      description: `Campaign: ${updates.name || campaign.value.name}`
    });

    sendResponse(res, 200, true, 'Campaign updated successfully', { campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    sendError(res, 500, 'Failed to update campaign', error);
  }
};

const publishCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await SystemSettings.findByPk(campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    await campaign.update({
      value: { ...campaign.value, status: 'active', publishedAt: new Date() }
    });

    sendResponse(res, 200, true, 'Campaign published successfully');
  } catch (error) {
    console.error('Publish campaign error:', error);
    sendError(res, 500, 'Failed to publish campaign', error);
  }
};

const stopCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await SystemSettings.findByPk(campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    await campaign.update({
      value: { ...campaign.value, status: 'stopped', stoppedAt: new Date() }
    });

    sendResponse(res, 200, true, 'Campaign stopped successfully');
  } catch (error) {
    console.error('Stop campaign error:', error);
    sendError(res, 500, 'Failed to stop campaign', error);
  }
};

// NOTIFICATION SYSTEM
const getNotifications = async (req, res) => {
  try {
    const notifications = await SystemSettings.findAll({
      where: { key: { [Op.like]: 'notification_%' } },
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Notifications retrieved successfully', { notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 500, 'Failed to retrieve notifications', error);
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers, targetBusinesses, scheduledFor } = req.body;

    const notification = await SystemSettings.create({
      key: `notification_${Date.now()}`,
      value: { title, message, type, targetUsers, targetBusinesses, scheduledFor, status: 'pending' },
      description: `Notification: ${title}`
    });

    sendResponse(res, 201, true, 'Notification created successfully', { notification });
  } catch (error) {
    console.error('Create notification error:', error);
    sendError(res, 500, 'Failed to create notification', error);
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers, targetBusinesses } = req.body;

    // Here you would implement the actual broadcasting logic
    // For now, we'll just log it
    console.log('Broadcasting notification:', { title, message, type, targetUsers, targetBusinesses });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Broadcasted notification: ${title}`,
      actionType: 'create',
      resource: 'Notification',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Notification broadcasted successfully');
  } catch (error) {
    console.error('Broadcast notification error:', error);
    sendError(res, 500, 'Failed to broadcast notification', error);
  }
};

module.exports = {
  getSettings,
  updateSetting,
  setMaintenanceMode,
  getActivityLogs,
  exportUsers,
  exportBusinesses,
  exportRevenueReport,
  getThemes,
  createTheme,
  updateTheme,
  assignThemeToBusiness,
  getCampaigns,
  createCampaign,
  updateCampaign,
  publishCampaign,
  stopCampaign,
  getNotifications,
  createNotification,
  broadcastNotification
};