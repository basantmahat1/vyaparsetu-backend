const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Business = require('./business.model');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_spent'
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'loyalty_points'
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
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

Customer.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Business.hasMany(Customer, { foreignKey: 'businessId', as: 'customers' });

module.exports = Customer;