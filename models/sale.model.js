const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Business = require('./business.model');
const User = require('./user.model');
const Customer = require('./customer.model');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    field: 'invoice_number'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'mobile_money', 'bank_transfer'),
    defaultValue: 'cash',
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.ENUM('paid', 'pending', 'partial'),
    defaultValue: 'paid',
    field: 'payment_status'
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
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.UUID,
    field: 'customer_id',
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
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
  tableName: 'sales',
  timestamps: true,
  underscored: true
});

// Associations
Sale.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Business.hasMany(Sale, { foreignKey: 'businessId', as: 'sales' });
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });

module.exports = Sale;