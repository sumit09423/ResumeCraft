const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { templateDataTypeMiddleware } = require('../utils/dataTypeConverter');
const { auth, authorize } = require('../middleware/auth');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, isPremium, limit = 20, page = 1 } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const templates = await Template.find(query)
      .sort({ usageCount: -1, 'rating.average': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-defaultConfig');

    const total = await Template.countDocuments(query);

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get popular templates
// @route   GET /api/templates/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const templates = await Template.getPopular(parseInt(limit));

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get templates by category
// @route   GET /api/templates/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const templates = await Template.getByCategory(req.params.category, parseInt(limit));

    res.status(200).json({
      success: true,
      count: templates.length,
      category: req.params.category,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findOne({ 
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      isActive: true 
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create new template (Admin only)
// @route   POST /api/templates
// @access  Private (Admin)
router.post('/', auth, authorize('admin', 'super_admin'), templateDataTypeMiddleware, async (req, res) => {
  try {
    const template = await Template.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: message
      });
    } else if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Template with this name or slug already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
});

// @desc    Update template (Admin only)
// @route   PUT /api/templates/:id
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin', 'super_admin'), templateDataTypeMiddleware, async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
});

// @desc    Delete template (Admin only)
// @route   DELETE /api/templates/:id
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    template.isActive = false;
    await template.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Rate template
// @route   POST /api/templates/:id/rate
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    await template.addRating(rating);

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'professional', name: 'Professional', description: 'Clean and formal templates' },
      { id: 'creative', name: 'Creative', description: 'Unique and artistic designs' },
      { id: 'minimal', name: 'Minimal', description: 'Simple and clean layouts' },
      { id: 'modern', name: 'Modern', description: 'Contemporary and trendy designs' },
      { id: 'classic', name: 'Classic', description: 'Traditional and timeless layouts' },
      { id: 'tech', name: 'Tech', description: 'Technology-focused templates' },
      { id: 'elegant', name: 'Elegant', description: 'Sophisticated and refined designs' }
    ];

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;
