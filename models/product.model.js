const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Business = require('./business.model');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'low_stock_threshold'
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  barcode: {
    type: DataTypes.STRING
  },
  businessId: {
    type: DataTypes.UUID,
    field: 'business_id',
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'products',
  timestamps: true,
  underscored: true
});

Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Business.hasMany(Product, { foreignKey: 'businessId', as: 'products' });

module.exports = Product;