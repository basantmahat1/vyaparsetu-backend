const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * 🎨 THEME ROUTES
 * Owner: build themes
 * Super Admin: manage platform
 */

// ========== 👑 OWNER ROUTES (Theme Builder) ==========

// Get theme (for editing)
router.get(
  '/store/:storeId/draft',
  authMiddleware,
  themeController.getDraftTheme
);

// Get published theme (for preview)
router.get(
  '/store/:storeId/published',
  themeController.getPublishedTheme
);

// Save theme (auto-save)
router.post(
  '/store/:storeId/save',
  authMiddleware,
  themeController.saveTheme
);

// Add section
router.post(
  '/store/:storeId/sections',
  authMiddleware,
  themeController.addSection
);

// Update section
router.put(
  '/store/:storeId/sections/:sectionId',
  authMiddleware,
  themeController.updateSection
);

// Delete section
router.delete(
  '/store/:storeId/sections/:sectionId',
  authMiddleware,
  themeController.deleteSection
);

// Reorder sections (drag & drop)
router.post(
  '/store/:storeId/sections/reorder',
  authMiddleware,
  themeController.reorderSections
);

// Update theme styles
router.put(
  '/store/:storeId/styles',
  authMiddleware,
  themeController.updateStyles
);

// Publish theme (make it live)
router.post(
  '/store/:storeId/publish',
  authMiddleware,
  themeController.publishTheme
);

// Get version history
router.get(
  '/store/:storeId/versions',
  authMiddleware,
  themeController.getVersions
);

// Rollback to version
router.post(
  '/store/:storeId/versions/:versionId/rollback',
  authMiddleware,
  themeController.rollbackVersion
);

// Undo/Redo
router.post(
  '/store/:storeId/undo',
  authMiddleware,
  themeController.undo
);

router.post(
  '/store/:storeId/redo',
  authMiddleware,
  themeController.redo
);

// ========== 🏪 MARKETPLACE ROUTES ==========

// Get all published themes (marketplace)
router.get(
  '/marketplace/themes',
  themeController.getMarketplaceThemes
);

// Get theme by ID (marketplace detail)
router.get(
  '/marketplace/themes/:themeId',
  themeController.getMarketplaceTheme
);

// Get featured themes
router.get(
  '/marketplace/featured',
  themeController.getFeaturedThemes
);

// Search themes
router.get(
  '/marketplace/search',
  themeController.searchThemes
);

// Use marketplace theme (owner duplicates it)
router.post(
  '/store/:storeId/use-template/:templateId',
  authMiddleware,
  themeController.useTemplate
);

// ========== 👑 SUPER ADMIN ROUTES ==========

// Get all themes (admin dashboard)
router.get(
  '/admin/themes',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.getAllThemes
);

// Approve theme for marketplace
router.post(
  '/admin/themes/:themeId/approve',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.approveTheme
);

// Reject theme
router.post(
  '/admin/themes/:themeId/reject',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.rejectTheme
);

// Feature theme in marketplace
router.post(
  '/admin/themes/:themeId/feature',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.featureTheme
);

// Create global template
router.post(
  '/admin/templates',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.createTemplate
);

// Get all templates (admin)
router.get(
  '/admin/templates',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.getTemplates
);

// Update template
router.put(
  '/admin/templates/:templateId',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.updateTemplate
);

// Delete template
router.delete(
  '/admin/templates/:templateId',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.deleteTemplate
);

// Monitor platform stats
router.get(
  '/admin/stats',
  authMiddleware,
  roleMiddleware(['super_admin']),
  themeController.getPlatformStats
);

module.exports = router;
