const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    enum: ['free', 'pro', 'premium']
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT
  },
  maxStaff: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  maxBranches: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  storageGB: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true
});

module.exports = Plan;