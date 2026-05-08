const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Business = require('./business.model');
const Plan = require('./plan.model');

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

Subscription.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Business.hasOne(Subscription, { foreignKey: 'businessId', as: 'subscription' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
Plan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

module.exports = Subscription;