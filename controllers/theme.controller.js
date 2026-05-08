const { Theme, ThemeVersion, ThemeTemplate } = require('../models');
const { v4: uuidv4 } = require('uuid');
const SECTION_TYPES = require('../../shared/constants/sectionTypes');
const ROLES = require('../../shared/constants/roles');

// 🔥 1. GET user's theme
exports.getTheme = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const theme = await Theme.findOne({
      where: { storeId, status: 'published' }
    });

    if (!theme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Theme not found' 
      });
    }

    res.json({
      success: true,
      theme: {
        id: theme.id,
        name: theme.name,
        sections: theme.sections || [],
        styles: theme.styles,
        status: theme.status,
        isPublished: theme.isPublished
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 2. GET draft theme (for editing)
exports.getDraftTheme = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { 
        storeId, 
        ownerId: userId,
        status: 'draft'
      }
    });

    if (!theme) {
      // Create default theme if doesn't exist
      const defaultTheme = await Theme.create({
        id: uuidv4(),
        storeId,
        ownerId: userId,
        name: 'Draft Theme',
        status: 'draft',
        sections: [],
        styles: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          fontFamily: 'Inter, sans-serif'
        }
      });
      
      return res.json({
        success: true,
        theme: defaultTheme
      });
    }

    res.json({
      success: true,
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 3. ADD SECTION
exports.addSection = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { type, title, subtitle, settings } = req.body;
    const userId = req.user?.id;

    let theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    const sections = theme.sections || [];
    const newSection = {
      id: uuidv4(),
      type,
      title: title || '',
      subtitle: subtitle || '',
      description: '',
      image: '',
      order: sections.length,
      isVisible: true,
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      layout: 'grid',
      columns: 3,
      items: [],
      settings: settings || {}
    };

    sections.push(newSection);

    await theme.update({ sections });

    res.json({
      success: true,
      message: 'Section added successfully',
      section: newSection,
      sections
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 4. UPDATE SECTION
exports.updateSection = async (req, res) => {
  try {
    const { storeId, sectionId } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    let sections = theme.sections || [];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      ...updates
    };

    await theme.update({ sections });

    res.json({
      success: true,
      message: 'Section updated successfully',
      section: sections[sectionIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 5. DELETE SECTION
exports.deleteSection = async (req, res) => {
  try {
    const { storeId, sectionId } = req.params;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    let sections = theme.sections || [];
    sections = sections.filter(s => s.id !== sectionId);

    // Reorder
    sections = sections.map((s, idx) => ({
      ...s,
      order: idx
    }));

    await theme.update({ sections });

    res.json({
      success: true,
      message: 'Section deleted successfully',
      sections
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 6. REORDER SECTIONS (Drag & Drop)
exports.reorderSections = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { sections } = req.body;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Update order
    const reorderedSections = sections.map((s, idx) => ({
      ...s,
      order: idx
    }));

    await theme.update({ sections: reorderedSections });

    res.json({
      success: true,
      message: 'Sections reordered successfully',
      sections: reorderedSections
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 7. UPDATE STYLES
exports.updateStyles = async (req, res) => {
  try {
    const { storeId } = req.params;
    const styleUpdates = req.body;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    const updatedStyles = {
      ...theme.styles,
      ...styleUpdates
    };

    await theme.update({ styles: updatedStyles });

    res.json({
      success: true,
      message: 'Styles updated successfully',
      styles: updatedStyles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 8. SAVE THEME (Save as version)
exports.saveTheme = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Create version snapshot
    const versionNumber = theme.version || 1;
    await ThemeVersion.create({
      id: uuidv4(),
      themeId: theme.id,
      storeId,
      versionNumber,
      name: name || `Version ${versionNumber}`,
      description: description || '',
      snapshot: {
        sections: theme.sections,
        styles: theme.styles,
        metadata: theme.metadata
      },
      createdBy: userId
    });

    // Update theme version
    await theme.update({
      version: versionNumber + 1,
      isDraft: true
    });

    res.json({
      success: true,
      message: 'Theme saved as version successfully',
      version: versionNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 9. PUBLISH THEME
exports.publishTheme = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user?.id;

    let theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Archive previous published version
    await Theme.update(
      { status: 'archived' },
      { where: { storeId, status: 'published' } }
    );

    // Publish current theme
    await theme.update({
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
      isDraft: false
    });

    // Create version snapshot
    await ThemeVersion.create({
      id: uuidv4(),
      themeId: theme.id,
      storeId,
      versionNumber: theme.version,
      name: `Published v${theme.version}`,
      isPublished: true,
      publishedAt: new Date(),
      snapshot: {
        sections: theme.sections,
        styles: theme.styles
      },
      createdBy: userId
    });

    res.json({
      success: true,
      message: 'Theme published successfully',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 10. GET VERSIONS
exports.getVersions = async (req, res) => {
  try {
    const { storeId } = req.params;

    const versions = await ThemeVersion.findAll({
      where: { storeId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      versions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 11. RESTORE FROM VERSION
exports.restoreVersion = async (req, res) => {
  try {
    const { storeId, versionId } = req.params;
    const userId = req.user?.id;

    const version = await ThemeVersion.findByPk(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Version not found'
      });
    }

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Restore snapshot
    await theme.update({
      sections: version.snapshot.sections,
      styles: version.snapshot.styles
    });

    res.json({
      success: true,
      message: 'Theme restored successfully',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 12. GET TEMPLATES
exports.getTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;

    const templates = await ThemeTemplate.findAll({
      where,
      order: [['downloads', 'DESC']]
    });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 13. USE TEMPLATE
exports.useTemplate = async (req, res) => {
  try {
    const { storeId, templateId } = req.params;
    const userId = req.user?.id;

    const template = await ThemeTemplate.findByPk(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    let theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      // Create new theme from template
      theme = await Theme.create({
        id: uuidv4(),
        storeId,
        ownerId: userId,
        name: template.name,
        status: 'draft',
        sections: template.templateData.sections || [],
        styles: template.templateData.styles
      });
    } else {
      // Update existing theme
      await theme.update({
        sections: template.templateData.sections || [],
        styles: template.templateData.styles
      });
    }

    // Increment downloads
    await template.increment('downloads');

    res.json({
      success: true,
      message: 'Template applied successfully',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 14. UNDO (Restore previous version)
exports.undo = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'draft' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found'
      });
    }

    // Get previous version
    const previousVersion = await ThemeVersion.findOne({
      where: { storeId, versionNumber: (theme.version - 1) },
      order: [['createdAt', 'DESC']]
    });

    if (!previousVersion) {
      return res.status(404).json({
        success: false,
        message: 'No previous version available'
      });
    }

    await theme.update({
      sections: previousVersion.snapshot.sections,
      styles: previousVersion.snapshot.styles
    });

    res.json({
      success: true,
      message: 'Undo successful',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 15. CREATE TEMPLATE FROM THEME
exports.createTemplateFromTheme = async (req, res) => {
  try {
    const { storeId, name, category, previewUrl } = req.body;
    const userId = req.user?.id;

    const theme = await Theme.findOne({
      where: { storeId, ownerId: userId, status: 'published' }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Published theme not found'
      });
    }

    const template = await ThemeTemplate.create({
      id: uuidv4(),
      name: name || `${theme.name} Template`,
      category: category || 'General',
      previewUrl: previewUrl || '',
      templateData: {
        sections: theme.sections,
        styles: theme.styles
      },
      createdBy: userId,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 16. UPLOAD IMAGE TO CLOUDINARY
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.json({
      success: true,
      url: req.file.path, // Cloudinary URL
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== 🏪 MARKETPLACE OPERATIONS ==========

// 🔥 GET MARKETPLACE THEMES
exports.getMarketplaceThemes = async (req, res) => {
  try {
    const { category, sortBy } = req.query;
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const where = { isPublished: true, isApproved: true };
    if (category) where.category = category;

    const order = [];
    if (sortBy === 'popular') order.push(['downloads', 'DESC']);
    else if (sortBy === 'latest') order.push(['createdAt', 'DESC']);
    else if (sortBy === 'rating') order.push(['rating', 'DESC']);
    else order.push(['createdAt', 'DESC']);

    const { rows, count } = await Theme.findAndCountAll({
      where,
      limit,
      offset,
      order,
      attributes: ['id', 'name', 'description', 'thumbnail', 'rating', 'downloads', 'category', 'author', 'createdAt']
    });

    res.json({
      success: true,
      themes: rows,
      total: count,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 GET FEATURED THEMES
exports.getFeaturedThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll({
      where: { isPublished: true, isApproved: true, isFeatured: true },
      limit: 4,
      order: [['rating', 'DESC']]
    });

    res.json({
      success: true,
      themes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 SEARCH THEMES
exports.searchThemes = async (req, res) => {
  try {
    const { q, category } = req.query;
    const limit = parseInt(req.query.limit) || 12;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const where = {
      isPublished: true,
      isApproved: true,
      [require('sequelize').Op.or]: [
        { name: { [require('sequelize').Op.like]: `%${q}%` } },
        { description: { [require('sequelize').Op.like]: `%${q}%` } },
        { author: { [require('sequelize').Op.like]: `%${q}%` } }
      ]
    };

    if (category) where.category = category;

    const themes = await Theme.findAll({
      where,
      limit,
      order: [['downloads', 'DESC']]
    });

    res.json({
      success: true,
      themes,
      count: themes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== 👑 ADMIN OPERATIONS ==========

// 🔥 GET ALL THEMES (ADMIN)
exports.getAllThemes = async (req, res) => {
  try {
    const { status, approval } = req.query;
    const where = {};

    if (status) where.status = status;
    if (approval === 'pending') where.isApproved = false;
    if (approval === 'approved') where.isApproved = true;

    const themes = await Theme.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'name',
        'description',
        'author',
        'category',
        'status',
        'isApproved',
        'isFeatured',
        'isPublished',
        'downloads',
        'rating',
        'primaryColor',
        'secondaryColor',
        'accentColor',
        'backgroundColor',
        'textColor',
        'fontFamily',
        'logoUrl',
        'styles',
        'sections',
        'createdAt'
      ]
    });

    res.json({
      success: true,
      themes,
      count: themes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 APPROVE THEME
exports.approveTheme = async (req, res) => {
  try {
    const { themeId } = req.params;

    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    await theme.update({ isApproved: true, approvedAt: new Date() });

    res.json({
      success: true,
      message: 'Theme approved successfully',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 REJECT THEME
exports.rejectTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const { reason } = req.body;

    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    await theme.update({ 
      isApproved: false, 
      rejectionReason: reason || null,
      rejectedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Theme rejected',
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 FEATURE THEME
exports.featureTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const { isFeatured } = req.body;

    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    await theme.update({ isFeatured });

    res.json({
      success: true,
      message: `Theme ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      theme
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 GET PLATFORM STATS
exports.getPlatformStats = async (req, res) => {
  try {
    const totalThemes = await Theme.count();
    const publishedThemes = await Theme.count({ where: { isPublished: true } });
    const approvedThemes = await Theme.count({ where: { isApproved: true } });
    const totalDownloads = await Theme.sum('downloads', { where: { isPublished: true } });
    
    const topThemes = await Theme.findAll({
      where: { isPublished: true },
      order: [['downloads', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'downloads', 'rating']
    });

    res.json({
      success: true,
      stats: {
        totalThemes,
        publishedThemes,
        approvedThemes,
        totalDownloads: totalDownloads || 0,
        averageRating: (await Theme.findAll({
          attributes: [[require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']],
          where: { isPublished: true }
        }))[0]?.avgRating || 0,
        topThemes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 CREATE THEME (ADMIN - For creating platform templates)
exports.createAdminTheme = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sections = [],
      colors = {},
      styles = {},
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      fontFamily,
      logoUrl
    } = req.body;
    const userId = req.user?.id;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Theme name and description are required'
      });
    }

    const theme = await Theme.create({
      id: uuidv4(),
      name,
      description,
      category: category || 'ecommerce',
      author: req.user?.name || 'Admin',
      sections: sections || [],
      styles: {
        primaryColor: colors.primary || primaryColor || '#3B82F6',
        secondaryColor: colors.secondary || secondaryColor || '#10B981',
        accentColor: colors.accent || accentColor || '#F59E0B',
        backgroundColor: colors.background || backgroundColor || '#FFFFFF',
        textColor: colors.text || textColor || '#1F2937',
        fontFamily: colors.fontFamily || fontFamily || 'Inter, sans-serif',
        ...styles
      },
      primaryColor: colors.primary || primaryColor || '#3B82F6',
      secondaryColor: colors.secondary || secondaryColor || '#10B981',
      accentColor: colors.accent || accentColor || '#F59E0B',
      backgroundColor: colors.background || backgroundColor || '#FFFFFF',
      textColor: colors.text || textColor || '#1F2937',
      fontFamily: colors.fontFamily || fontFamily || 'Inter, sans-serif',
      logoUrl: logoUrl || null,
      status: 'draft',
      isPublished: false,
      isDraft: true,
      isApproved: false,
      isFeatured: false,
      downloads: 0,
      rating: 5
    });

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      theme
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔥 UPDATE THEME (ADMIN - For editing platform templates)
exports.updateAdminTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const {
      name,
      description,
      category,
      sections,
      colors = {},
      styles = {},
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      fontFamily,
      logoUrl
    } = req.body;

    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    await theme.update({
      name: name || theme.name,
      description: description || theme.description,
      category: category || theme.category,
      sections: sections !== undefined ? sections : theme.sections,
      styles: {
        primaryColor: colors.primary || primaryColor || theme.styles?.primaryColor || '#3B82F6',
        secondaryColor: colors.secondary || secondaryColor || theme.styles?.secondaryColor || '#10B981',
        accentColor: colors.accent || accentColor || theme.styles?.accentColor || '#F59E0B',
        backgroundColor: colors.background || backgroundColor || theme.styles?.backgroundColor || '#FFFFFF',
        textColor: colors.text || textColor || theme.styles?.textColor || '#1F2937',
        fontFamily: colors.fontFamily || fontFamily || theme.styles?.fontFamily || 'Inter, sans-serif',
        ...styles
      },
      primaryColor: colors.primary || primaryColor || theme.primaryColor || theme.styles?.primaryColor || '#3B82F6',
      secondaryColor: colors.secondary || secondaryColor || theme.secondaryColor || theme.styles?.secondaryColor || '#10B981',
      accentColor: colors.accent || accentColor || theme.accentColor || theme.styles?.accentColor || '#F59E0B',
      backgroundColor: colors.background || backgroundColor || theme.backgroundColor || theme.styles?.backgroundColor || '#FFFFFF',
      textColor: colors.text || textColor || theme.textColor || theme.styles?.textColor || '#1F2937',
      fontFamily: colors.fontFamily || fontFamily || theme.fontFamily || theme.styles?.fontFamily || 'Inter, sans-serif',
      logoUrl: logoUrl || theme.logoUrl
    });

    res.json({
      success: true,
      message: 'Theme updated successfully',
      theme
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
