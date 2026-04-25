const { Product } = require('../models');
const { sendResponse, sendError } = require('../utils/response');
const { Op } = require('sequelize');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;
    const businessId = req.businessId || req.query.businessId;

    if (!businessId && req.user.role !== 'super_admin') {
      return sendError(res, 403, 'Business ID required');
    }

    let whereClause = { businessId };
    
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (category) {
      whereClause.category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    sendResponse(res, 200, true, 'Products retrieved', {
      products: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get products error:', error);
    sendError(res, 500, 'Failed to get products', error);
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId || req.query.businessId;

    const product = await Product.findOne({
      where: { id, businessId }
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendResponse(res, 200, true, 'Product retrieved', product);
  } catch (error) {
    sendError(res, 500, 'Failed to get product', error);
  }
};

const createProduct = async (req, res) => {
  try {
    const businessId = req.businessId || req.body.businessId;
    
    if (!businessId && req.user.role !== 'super_admin') {
      return sendError(res, 403, 'Business ID required');
    }

    const product = await Product.create({
      ...req.body,
      businessId
    });

    sendResponse(res, 201, true, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, 'Failed to create product', error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId || req.query.businessId;

    const product = await Product.findOne({
      where: { id, businessId }
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.update(req.body);

    sendResponse(res, 200, true, 'Product updated successfully', product);
  } catch (error) {
    console.error('Update product error:', error);
    sendError(res, 500, 'Failed to update product', error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.businessId || req.query.businessId;

    const product = await Product.findOne({
      where: { id, businessId }
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.destroy();

    sendResponse(res, 200, true, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    sendError(res, 500, 'Failed to delete product', error);
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const businessId = req.businessId || req.query.businessId;

    const product = await Product.findOne({
      where: { id, businessId }
    });

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return sendError(res, 400, 'Insufficient stock');
    }

    await product.update({ stock: newStock });

    sendResponse(res, 200, true, 'Stock updated successfully', product);
  } catch (error) {
    console.error('Update stock error:', error);
    sendError(res, 500, 'Failed to update stock', error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};