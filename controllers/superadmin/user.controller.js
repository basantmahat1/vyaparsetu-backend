const { User, ActivityLog, sequelize } = require('../../models');
const { sendResponse, sendError } = require('../../utils/response');
const { Op } = require('sequelize');

// USER MANAGEMENT
const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (status) where.isActive = status === 'active';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Users retrieved', {
      data: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 500, 'Failed to get users', error);
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({ isActive: false });
    
    await ActivityLog.create({
      userId: req.user.id,
      action: `Banned user: ${reason || 'No reason provided'}`,
      actionType: 'update',
      resource: 'User',
      status: 'success'
    });

    sendResponse(res, 200, true, 'User banned successfully', user);
  } catch (error) {
    console.error('Ban user error:', error);
    sendError(res, 500, 'Failed to ban user', error);
  }
};

const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({ isActive: true });
    
    await ActivityLog.create({
      userId: req.user.id,
      action: 'Unbanned user',
      actionType: 'update',
      resource: 'User',
      status: 'success'
    });

    sendResponse(res, 200, true, 'User unbanned successfully', user);
  } catch (error) {
    console.error('Unban user error:', error);
    sendError(res, 500, 'Failed to unban user', error);
  }
};

const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const loginLogs = await ActivityLog.findAll({
      where: {
        userId,
        actionType: 'login'
      },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Login history retrieved', loginLogs);
  } catch (error) {
    console.error('Get login history error:', error);
    sendError(res, 500, 'Failed to get login history', error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({ password: newPassword });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Reset password for user: ${user.email}`,
      actionType: 'update',
      resource: 'User',
      status: 'success'
    });

    sendResponse(res, 200, true, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 500, 'Failed to reset password', error);
  }
};

const forceLogout = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({ tokenVersion: (user.tokenVersion || 0) + 1 });

    await ActivityLog.create({
      userId: req.user.id,
      action: `Forced logout for user: ${user.email}`,
      actionType: 'update',
      resource: 'User',
      status: 'success'
    });

    sendResponse(res, 200, true, 'User forced to logout');
  } catch (error) {
    console.error('Force logout error:', error);
    sendError(res, 500, 'Failed to force logout', error);
  }
};

module.exports = {
  getUsers,
  banUser,
  unbanUser,
  getLoginHistory,
  resetPassword,
  forceLogout
};