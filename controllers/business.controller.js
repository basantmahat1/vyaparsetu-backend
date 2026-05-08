const { Business, User, Product, Sale } = require('../models');
const { sendResponse, sendError } = require('../utils/response');
const { Op } = require('sequelize');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// KYC Document Upload Configuration
const kycStorage = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'vyaparsetu/kyc-documents',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      }
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/kyc');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const kycUpload = multer({
  storage: kycStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
  }
}).fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
  { name: 'panVatCert', maxCount: 1 },
  { name: 'registrationCert', maxCount: 1 },
  { name: 'businessLogo', maxCount: 1 }
]);

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

const submitBusinessKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      email,
      province,
      district,
      city,
      businessName,
      businessType,
      panVatNumber,
      businessAddress,
      documentType,
      consent
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !email || !province || !district || !city ||
        !businessName || !businessType || !panVatNumber || !businessAddress ||
        !documentType || !consent) {
      return sendError(res, 400, 'All required fields must be provided');
    }

    if (!req.files || !req.files.idFront || !req.files.idBack || !req.files.selfie || !req.files.panVatCert) {
      return sendError(res, 400, 'Required documents must be uploaded');
    }

    const business = await Business.findByPk(id);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }

    // Extract file URLs from uploads
    const fileUrls = {};
    Object.keys(req.files).forEach(fieldName => {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        // If using Cloudinary, path is the URL; if local storage, create a URL
        const file = req.files[fieldName][0];
        if (file.path.startsWith('http')) {
          // Cloudinary URL
          fileUrls[fieldName + 'Url'] = file.path;
        } else {
          // Local file path - create accessible URL
          fileUrls[fieldName + 'Url'] = `/uploads/kyc/${path.basename(file.path)}`;
        }
      }
    });

    // Update business with KYC data
    await business.update({
      // Owner Information
      ownerFullName: fullName,
      ownerPhone: phone,
      ownerEmail: email,
      ownerProvince: province,
      ownerDistrict: district,
      ownerCity: city,
      // Business Information
      businessType,
      panVatNumber,
      businessAddress,
      documentType,
      // Document URLs
      ...fileUrls,
      // Status
      kycStatus: 'pending',
      rejectionReason: null,
      isApproved: false,
      kycSubmittedAt: new Date()
    });

    sendResponse(res, 200, true, 'KYC submitted successfully', {
      business: business,
      message: 'Your KYC has been submitted and is pending verification.'
    });
  } catch (error) {
    console.error('Submit business KYC error:', error);
    sendError(res, 500, 'Failed to submit KYC', error.message);
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
  submitBusinessKyc,
  updateBusiness,
  deleteBusiness,
  getBusinessStats,
  kycUpload
};