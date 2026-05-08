const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const KycDetail = sequelize.define('KycDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'business_id',
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  province: {
    type: DataTypes.STRING
  },
  district: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  documentType: {
    type: DataTypes.STRING,
    field: 'document_type'
  },
  businessName: {
    type: DataTypes.STRING,
    field: 'business_name'
  },
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
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at'
  }
}, {
  tableName: 'kyc_details',
  timestamps: true,
  underscored: true
});

module.exports = KycDetail;