const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    field: 'business_id',
    references: {
      model: 'businesses',
      key: 'id'
    },
    allowNull: false
  },
  planId: {
    type: DataTypes.UUID,
    field: 'plan_id',
    references: {
      model: 'plans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    field: 'end_date'
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'auto_renew'
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
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true
});

module.exports = Subscription;