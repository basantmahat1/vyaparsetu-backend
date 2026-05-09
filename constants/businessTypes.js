/**
 * Business Type Constants
 * Defines all supported business types and their default categories
 */

const BUSINESS_TYPES = {
  RESTAURANT: 'restaurant',
  PHARMACY: 'pharmacy',
  CLOTHING: 'clothing',
  ELECTRONICS: 'electronics',
  GROCERY: 'grocery',
  KIRANA: 'kirana',
  GENERAL: 'general'
};

/**
 * Default categories mapped by business type
 */
const DEFAULT_CATEGORIES_BY_TYPE = {
  [BUSINESS_TYPES.RESTAURANT]: [
    { name: 'Pizza', description: 'Pizza and breads' },
    { name: 'Burger', description: 'Burgers and sandwiches' },
    { name: 'Momo', description: 'Dumplings and momos' },
    { name: 'Drinks', description: 'Beverages and drinks' },
    { name: 'Desserts', description: 'Desserts and sweets' },
    { name: 'Starters', description: 'Appetizers and starters' }
  ],
  [BUSINESS_TYPES.PHARMACY]: [
    { name: 'Tablets', description: 'Tablet medications' },
    { name: 'Capsules', description: 'Capsule medications' },
    { name: 'Syrup', description: 'Liquid syrup medications' },
    { name: 'Injections', description: 'Injectable medications' },
    { name: 'Ointments', description: 'Topical ointments and creams' },
    { name: 'Supplements', description: 'Health supplements' }
  ],
  [BUSINESS_TYPES.CLOTHING]: [
    { name: 'Men', description: 'Menswear' },
    { name: 'Women', description: 'Womenswear' },
    { name: 'Kids', description: 'Kidswear' },
    { name: 'Shoes', description: 'Footwear' },
    { name: 'Accessories', description: 'Fashion accessories' },
    { name: 'Ethnic Wear', description: 'Traditional clothing' }
  ],
  [BUSINESS_TYPES.ELECTRONICS]: [
    { name: 'Phones', description: 'Mobile phones' },
    { name: 'Laptops', description: 'Computers and laptops' },
    { name: 'Tablets', description: 'Tablets and iPads' },
    { name: 'Accessories', description: 'Chargers and cables' },
    { name: 'Audio', description: 'Headphones and speakers' },
    { name: 'Others', description: 'Other electronics' }
  ],
  [BUSINESS_TYPES.GROCERY]: [
    { name: 'Vegetables', description: 'Fresh vegetables' },
    { name: 'Fruits', description: 'Fresh fruits' },
    { name: 'Grains', description: 'Rice, wheat, pulses' },
    { name: 'Spices', description: 'Spices and seasonings' },
    { name: 'Dairy', description: 'Milk and dairy products' },
    { name: 'Oils', description: 'Cooking oils and ghee' }
  ],
  [BUSINESS_TYPES.KIRANA]: [
    { name: 'General', description: 'General items' },
    { name: 'Snacks', description: 'Snacks and munchies' },
    { name: 'Household', description: 'Household items' },
    { name: 'Personal Care', description: 'Personal care products' },
    { name: 'Beverages', description: 'Tea, coffee, drinks' },
    { name: 'Tobacco', description: 'Tobacco products' }
  ],
  [BUSINESS_TYPES.GENERAL]: [
    { name: 'General', description: 'General category' }
  ]
};

/**
 * Business type labels for UI
 */
const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.RESTAURANT]: '🍕 Restaurant',
  [BUSINESS_TYPES.PHARMACY]: '💊 Pharmacy',
  [BUSINESS_TYPES.CLOTHING]: '👕 Clothing Store',
  [BUSINESS_TYPES.ELECTRONICS]: '📱 Electronics',
  [BUSINESS_TYPES.GROCERY]: '🛒 Grocery Store',
  [BUSINESS_TYPES.KIRANA]: '🏪 Kirana Store',
  [BUSINESS_TYPES.GENERAL]: '🏢 General Business'
};

/**
 * Get default categories for a business type
 */
const getDefaultCategories = (businessType) => {
  return DEFAULT_CATEGORIES_BY_TYPE[businessType] || DEFAULT_CATEGORIES_BY_TYPE[BUSINESS_TYPES.GENERAL];
};

/**
 * Get all business types with labels
 */
const getAllBusinessTypes = () => {
  return Object.keys(BUSINESS_TYPES).map(key => ({
    value: BUSINESS_TYPES[key],
    label: BUSINESS_TYPE_LABELS[BUSINESS_TYPES[key]]
  }));
};

module.exports = {
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  DEFAULT_CATEGORIES_BY_TYPE,
  getDefaultCategories,
  getAllBusinessTypes
};
