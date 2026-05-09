const Business = require('./business.model');
const User = require('./user.model');
const Product = require('./product.model');

const Customer = require('./customer.model');
const Sale = require('./sale.model');
const SaleItem = require('./saleItem.model');
const Plan = require('./plan.model');
const Subscription = require('./subscription.model');
const SupportTicket = require('./supportTicket.model');
const PaymentHistory = require('./paymentHistory.model');
const SystemSettings = require('./systemSettings.model');
const ActivityLog = require('./activityLog.model');
const Theme = require('./theme.model');
const ThemeVersion = require('./themeVersion.model');
const ThemeTemplate = require('./themeTemplate.model');
const Campaign = require('./campaign.model');
const Notification = require('./notification.model');

module.exports = {
  Business,
  User,
  Product,
  
  Customer,
  Sale,
  SaleItem,
  Plan,
  Subscription,
  SupportTicket,
  PaymentHistory,
  SystemSettings,
  ActivityLog,
  Theme,
  ThemeVersion,
  ThemeTemplate,
  Campaign,
  Notification
};