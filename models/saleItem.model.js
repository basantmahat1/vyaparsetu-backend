const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Sale = require('./sale.model');
const Product = require('./product.model');

const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  saleId: {
    type: DataTypes.UUID,
    field: 'sale_id',
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    field: 'product_id',
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
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
  tableName: 'sale_items',
  timestamps: true,
  underscored: true
});

// Associations
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });

module.exports = SaleItem;