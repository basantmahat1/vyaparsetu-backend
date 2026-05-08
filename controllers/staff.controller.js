const { User } = require('../models');
const { sendResponse, sendError } = require('../utils/response');

const STAFF_ROLES = ['cashier', 'inventory', 'delivery', 'manager'];

const getStaff = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    if (!businessId) {
      return sendError(res, 400, 'Owner business context is required');
    }

    const staff = await User.findAll({
      where: {
        businessId,
        role: STAFF_ROLES
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Staff retrieved successfully', { staff });
  } catch (error) {
    console.error('Get staff error:', error);
    sendError(res, 500, 'Failed to retrieve staff', error);
  }
};

const createStaff = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { name, email, role, permissions = [] } = req.body;

    if (!businessId) {
      return sendError(res, 400, 'Owner business context is required');
    }

    if (!name || !email || !role) {
      return sendError(res, 400, 'Name, email, and role are required');
    }

    if (!STAFF_ROLES.includes(role)) {
      return sendError(res, 400, 'Invalid staff role');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 400, 'A user with this email already exists');
    }

    // Generate random password
    const initialPassword = Math.random().toString(36).slice(-10) + 'Ss@1';

    const staff = await User.create({
      name,
      email,
      password: initialPassword,
      role,
      businessId,
      isActive: true,
      permissions
    });

    const staffData = staff.toJSON();
    delete staffData.password;

    sendResponse(res, 201, true, 'Staff account created successfully', {
      staff: staffData,
      initialPassword,
      message: `Staff created with temporary password: ${initialPassword}`
    });
  } catch (error) {
    console.error('Create staff error:', error);
    sendError(res, 500, 'Failed to create staff account', error);
  }
};

const deleteStaff = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { id } = req.params;

    const staff = await User.findOne({ where: { id, businessId } });
    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    if (staff.role === 'owner' || staff.role === 'super_admin') {
      return sendError(res, 403, 'Cannot delete this user role');
    }

    await staff.destroy();
    sendResponse(res, 200, true, 'Staff member deleted successfully');
  } catch (error) {
    console.error('Delete staff error:', error);
    sendError(res, 500, 'Failed to delete staff member', error);
  }
};

module.exports = { getStaff, createStaff, deleteStaff };