const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 🔥 Pre-built Templates for quick start
const ThemeTemplate = sequelize.define('ThemeTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'description'
  },
  category: {
    type: DataTypes.ENUM('ecommerce', 'restaurant', 'saas', 'portfolio', 'blog', 'service'),
    defaultValue: 'ecommerce',
    field: 'category'
  },
  thumbnail: {
    type: DataTypes.TEXT,
    field: 'thumbnail'
  },
  preview: {
    type: DataTypes.TEXT,
    field: 'preview'
  },
  // Template structure (JSON - sections + styles)
  templateData: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'template_data'
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'price'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5,
    field: 'rating'
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'downloads'
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by'
  }
}, {
  tableName: 'theme_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ThemeTemplate;
