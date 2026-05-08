const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'store_id'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'My Theme'
  },
  description: {
    type: DataTypes.TEXT
  },
  thumbnail: {
    type: DataTypes.TEXT
  },

  // 🧱 SECTIONS - website blocks (Hero, Products, Footer, etc)
  sections: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of section objects with id, type, order, content, styles'
  },

  // 🎨 GLOBAL STYLES - color scheme, fonts, spacing
  styles: {
    type: DataTypes.JSON,
    defaultValue: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      fontFamily: 'Inter, sans-serif',
      headingFontFamily: 'Inter, sans-serif',
      fontSize: 16,
      borderRadius: 8,
      shadow: true,
      spacing: 16
    },
    field: 'styles'
  },
  primaryColor: {
    type: DataTypes.STRING,
    field: 'primary_color'
  },
  secondaryColor: {
    type: DataTypes.STRING,
    field: 'secondary_color'
  },
  accentColor: {
    type: DataTypes.STRING,
    field: 'accent_color'
  },
  backgroundColor: {
    type: DataTypes.STRING,
    field: 'background_color'
  },
  textColor: {
    type: DataTypes.STRING,
    field: 'text_color'
  },
  fontFamily: {
    type: DataTypes.STRING,
    field: 'font_family'
  },
  logoUrl: {
    type: DataTypes.STRING,
    field: 'logo_url'
  },
  // Theme Status
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    field: 'status'
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
  isDraft: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_draft'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'version'
  },
  metadata: {
    type: DataTypes.JSON,
    field: 'metadata'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'themes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Theme;