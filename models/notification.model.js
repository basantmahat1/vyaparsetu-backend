const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'promotion'),
    defaultValue: 'info'
  },
  targetType: {
    type: DataTypes.ENUM('all', 'business', 'user', 'role'),
    field: 'target_type',
    defaultValue: 'all'
  },
  targetIds: {
    type: DataTypes.JSON,
    field: 'target_ids'
  },
  isBroadcast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_broadcast'
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at'
  },
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'read_count'
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Notification;