const express = require('express');
const router = express.Router();
const themeController = require('../controllers/theme.controller');
const protect = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { upload } = require('../config/cloudinary');

// 🔥 PUBLIC ROUTES (published theme)
router.get('/:storeId', themeController.getTheme);

// ========== 🏪 MARKETPLACE ROUTES (PUBLIC) ==========
router.get('/marketplace/themes', themeController.getMarketplaceThemes);
router.get('/marketplace/featured', themeController.getFeaturedThemes);
router.get('/marketplace/search', themeController.searchThemes);

// 🔥 PROTECTED ROUTES (requires login)
router.use(protect);

// IMAGE UPLOAD
router.post('/upload', upload.single('image'), themeController.uploadImage);

// Draft Theme (for editing)
router.get('/:storeId/draft', themeController.getDraftTheme);

// SECTION OPERATIONS
router.post('/:storeId/sections/add', themeController.addSection);
router.put('/:storeId/sections/:sectionId', themeController.updateSection);
router.delete('/:storeId/sections/:sectionId', themeController.deleteSection);
router.post('/:storeId/sections/reorder', themeController.reorderSections);

// STYLES
router.put('/:storeId/styles', themeController.updateStyles);

// SAVE & PUBLISH
router.post('/:storeId/save', themeController.saveTheme);
router.post('/:storeId/publish', themeController.publishTheme);

// VERSIONS
router.get('/:storeId/versions', themeController.getVersions);
router.post('/:storeId/versions/:versionId/restore', themeController.restoreVersion);

// UNDO/REDO
router.post('/:storeId/undo', themeController.undo);

// TEMPLATES
router.get('/templates/list', themeController.getTemplates);
router.post('/templates/create', themeController.createTemplateFromTheme);
router.post('/:storeId/templates/:templateId/use', themeController.useTemplate);

// ========== 👑 ADMIN ROUTES ==========
router.use(roleMiddleware(['super_admin']));

// Theme management
router.get('/admin/themes', themeController.getAllThemes);
router.post('/admin/themes', themeController.createAdminTheme);
router.put('/admin/themes/:themeId', themeController.updateAdminTheme);

// Theme approval workflow
router.post('/admin/themes/:themeId/approve', themeController.approveTheme);
router.post('/admin/themes/:themeId/reject', themeController.rejectTheme);
router.post('/admin/themes/:themeId/feature', themeController.featureTheme);

// Platform stats
router.get('/admin/stats', themeController.getPlatformStats);

module.exports = router;

