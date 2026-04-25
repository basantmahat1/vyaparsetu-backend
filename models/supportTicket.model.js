const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicket = sequelize.define('SupportTicket', {
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
    }
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('technical', 'billing', 'general', 'bug'),
    defaultValue: 'general'
  },
  status: {
    type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  assignedTo: {
    type: DataTypes.UUID,
    field: 'assigned_to'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
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
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at'
  }
}, {
  tableName: 'support_tickets',
  timestamps: true,
  underscored: true
});

module.exports = SupportTicket;