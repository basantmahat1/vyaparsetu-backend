const router = require('express').Router();
const dashboardController = require('../../controllers/superadmin/dashboard.controller');
const userController = require('../../controllers/superadmin/user.controller');
const planController = require('../../controllers/superadmin/plan.controller');
const billingController = require('../../controllers/superadmin/billing.controller');
const supportController = require('../../controllers/superadmin/support.controller');
const settingsController = require('../../controllers/superadmin/settings.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Middleware
router.use(authMiddleware);
router.use(roleMiddleware('super_admin'));

// DASHBOARD
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// BUSINESS MANAGEMENT
router.get('/businesses', dashboardController.getBusinesses);
router.post('/businesses/:businessId/approve', dashboardController.approveBusiness);
router.post('/businesses/:businessId/reject', dashboardController.rejectBusiness);
router.post('/businesses/:businessId/suspend', dashboardController.suspendBusiness);
router.post('/businesses/:businessId/reactivate', dashboardController.reactivateBusiness);
router.put('/businesses/:businessId', dashboardController.updateBusinessDetails);
router.delete('/businesses/:businessId', dashboardController.deleteBusiness);

// USER MANAGEMENT
router.get('/users', userController.getUsers);
router.post('/users/:userId/ban', userController.banUser);
router.post('/users/:userId/unban', userController.unbanUser);
router.post('/users/:userId/reset-password', userController.resetPassword);
router.post('/users/:userId/force-logout', userController.forceLogout);
router.get('/users/:userId/login-history', userController.getLoginHistory);

// PLANS & SUBSCRIPTIONS
router.get('/plans', planController.getPlans);
router.post('/plans', planController.createPlan);
router.put('/plans/:planId', planController.updatePlan);
router.post('/subscriptions/assign', planController.assignPlanToBusinesses);
router.get('/subscriptions', planController.getSubscriptions);
router.post('/subscriptions/:subscriptionId/cancel', planController.cancelSubscription);

// BILLING & REVENUE
router.get('/billing/revenue', billingController.getRevenueOverview);
router.get('/billing/payments', billingController.getPaymentHistory);
router.post('/billing/payments/:paymentId/refund', billingController.refundPayment);

// SUPPORT TICKETS
router.get('/support/tickets', supportController.getSupportTickets);
router.post('/support/tickets/:ticketId/assign', supportController.assignTicket);
router.post('/support/tickets/:ticketId/resolve', supportController.resolveTicket);

// SYSTEM SETTINGS
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSetting);
router.post('/settings/maintenance', settingsController.setMaintenanceMode);
router.get('/activity-logs', settingsController.getActivityLogs);

// REPORTS
router.get('/reports/users', settingsController.exportUsers);
router.get('/reports/businesses', settingsController.exportBusinesses);
router.get('/reports/revenue', settingsController.exportRevenueReport);

module.exports = router;