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
    allowNull: false,
    unique: true
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