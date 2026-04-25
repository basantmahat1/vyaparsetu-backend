const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  businessId: {
    type: DataTypes.UUID,
    field: 'business_id',
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  actionType: {
    type: DataTypes.ENUM('login', 'logout', 'create', 'update', 'delete', 'download'),
    field: 'action_type'
  },
  resource: {
    type: DataTypes.STRING
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    defaultValue: 'success'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'activity_logs',
  timestamps: false,
  underscored: true
});

module.exports = ActivityLog;