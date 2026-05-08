const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
    allowNull: false
  },
  targetAudience: {
    type: DataTypes.JSON,
    field: 'target_audience'
  },
  content: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    field: 'scheduled_at'
  },
  startedAt: {
    type: DataTypes.DATE,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by'
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Campaign;