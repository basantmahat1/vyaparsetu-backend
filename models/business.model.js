const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  plan: {
    type: DataTypes.ENUM('basic', 'professional', 'enterprise'),
    defaultValue: 'basic'
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_approved'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    field: 'kyc_status'
  },
  // KYC Owner Information
  ownerFullName: {
    type: DataTypes.STRING,
    field: 'owner_full_name'
  },
  ownerPhone: {
    type: DataTypes.STRING,
    field: 'owner_phone'
  },
  ownerEmail: {
    type: DataTypes.STRING,
    field: 'owner_email'
  },
  ownerProvince: {
    type: DataTypes.STRING,
    field: 'owner_province'
  },
  ownerDistrict: {
    type: DataTypes.STRING,
    field: 'owner_district'
  },
  ownerCity: {
    type: DataTypes.STRING,
    field: 'owner_city'
  },
  // KYC Business Information
  businessType: {
    type: DataTypes.STRING,
    field: 'business_type'
  },
  panVatNumber: {
    type: DataTypes.STRING,
    field: 'pan_vat_number'
  },
  businessAddress: {
    type: DataTypes.TEXT,
    field: 'business_address'
  },
  documentType: {
    type: DataTypes.ENUM('citizenship', 'nationalId'),
    field: 'document_type'
  },
  // KYC Document URLs
  idFrontUrl: {
    type: DataTypes.STRING,
    field: 'id_front_url'
  },
  idBackUrl: {
    type: DataTypes.STRING,
    field: 'id_back_url'
  },
  selfieUrl: {
    type: DataTypes.STRING,
    field: 'selfie_url'
  },
  panVatCertUrl: {
    type: DataTypes.STRING,
    field: 'pan_vat_cert_url'
  },
  registrationCertUrl: {
    type: DataTypes.STRING,
    field: 'registration_cert_url'
  },
  businessLogoUrl: {
    type: DataTypes.STRING,
    field: 'business_logo_url'
  },
  kycSubmittedAt: {
    type: DataTypes.DATE,
    field: 'kyc_submitted_at'
  },
  maxStaff: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'max_staff'
  },
  maxBranches: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'max_branches'
  },
  storageGB: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'storage_gb'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  themeId: {
    type: DataTypes.UUID,
    field: 'theme_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  underscored: true
});

module.exports = Business;