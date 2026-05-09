const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Category Model
 * Manages product categories with business type awareness
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Businesses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    trim: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    trim: true,
    validate: {
      notEmpty: true
    }
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: false,
    default: 'general'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is a system-created default category'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Soft delete support'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order for displaying categories'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Hex color code for category (e.g., #FF5733)'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Emoji or icon identifier'
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Cached product count'
  }
}, {
  tableName: 'Categories',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['businessId', 'slug'], unique: true },
    { fields: ['isActive'] }
  ]
});

/**
 * Generate URL-safe slug from category name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Hooks
 */
Category.beforeCreate((category) => {
  if (!category.slug) {
    category.slug = generateSlug(category.name);
  }
});

Category.beforeUpdate((category) => {
  if (category.changed('name')) {
    category.slug = generateSlug(category.name);
  }
});

/**
 * Instance Methods
 */
Category.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

/**
 * Static Methods
 */

/**
 * Get categories for a business
 */
Category.findByBusiness = async function (businessId, includeInactive = false) {
  const where = { businessId };
  if (!includeInactive) {
    where.isActive = true;
  }

  return this.findAll({
    where,
    order: [['displayOrder', 'ASC'], ['name', 'ASC']]
  });
};

/**
 * Find by slug and business
 */
Category.findBySlug = async function (businessId, slug) {
  return this.findOne({
    where: { businessId, slug, isActive: true }
  });
};

/**
 * Create multiple categories at once
 */
Category.createMultiple = async function (businessId, categories, businessType, isDefault = false) {
  const categoriesWithBusiness = categories.map(cat => ({
    businessId,
    name: cat.name,
    description: cat.description || '',
    businessType,
    isDefault,
    slug: generateSlug(cat.name),
    displayOrder: categories.indexOf(cat)
  }));

  return this.bulkCreate(categoriesWithBusiness);
};

module.exports = Category;
