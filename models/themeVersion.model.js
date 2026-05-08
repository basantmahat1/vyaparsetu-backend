const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 🔥 Theme Version Control (like git history)
const ThemeVersion = sequelize.define('ThemeVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  themeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'theme_id'
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'store_id'
  },
  // Complete theme snapshot (JSON)
  snapshot: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'snapshot'
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'version_number'
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'Version',
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'description'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  changeLog: {
    type: DataTypes.JSON,
    field: 'change_log'
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by'
  }
}, {
  tableName: 'theme_versions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ThemeVersion;
