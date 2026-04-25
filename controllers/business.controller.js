const { Business, User, Product, Sale } = require('../models');
const { sendResponse, sendError } = require('../utils/response');
const { Op } = require('sequelize');

const getBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Business.findAndCountAll({
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'name', 'email', 'role'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Businesses retrieved', {
      businesses: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    sendError(res, 500, 'Failed to get businesses', error);
  }
};

const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      include: [
        { model: User, as: 'users', attributes: { exclude: ['password'] } },
        { model: Product, as: 'products', limit: 10 },
        { model: Sale, as: 'sales', limit: 10 }
      ]
    });

    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    sendResponse(res, 200, true, 'Business retrieved', business);
  } catch (error) {
    sendError(res, 500, 'Failed to get business', error);
  }
};

const createBusiness = async (req, res) => {
  try {
    const { name, email, phone, address, plan } = req.body;

    const existingBusiness = await Business.findOne({ where: { name } });
    if (existingBusiness) {
      return sendError(res, 400, 'Business name already exists');
    }

    const business = await Business.create({
      name,
      email,
      phone,
      address,
      plan: plan || 'basic'
    });

    sendResponse(res, 201, true, 'Business created successfully', business);
  } catch (error) {
    console.error('Create business error:', error);
    sendError(res, 500, 'Failed to create business', error);
  }
};

const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.update(req.body);

    sendResponse(res, 200, true, 'Business updated successfully', business);
  } catch (error) {
    console.error('Update business error:', error);
    sendError(res, 500, 'Failed to update business', error);
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    await business.destroy();

    sendResponse(res, 200, true, 'Business deleted successfully');
  } catch (error) {
    console.error('Delete business error:', error);
    sendError(res, 500, 'Failed to delete business', error);
  }
};

const getBusinessStats = async (req, res) => {
  try {
    const { id } = req.params;

    const totalProducts = await Product.count({ where: { businessId: id } });
    const totalSales = await Sale.count({ where: { businessId: id } });
    const totalRevenue = await Sale.sum('total', { where: { businessId: id } });
    const totalUsers = await User.count({ where: { businessId: id } });

    sendResponse(res, 200, true, 'Business stats retrieved', {
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue || 0,
      totalUsers
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    sendError(res, 500, 'Failed to get business stats', error);
  }
};

module.exports = {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessStats
};