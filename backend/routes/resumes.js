const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { auth, authorize } = require('../middleware/auth');
const { resumeDataTypeMiddleware } = require('../utils/dataTypeConverter');
const { upload } = require('../config/cloudinary');
const fs = require('fs');
const SimplePDFGenerator = require('../utils/simplePdfGenerator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       description: Resume model with automatic data type conversion. Screenshot URLs are automatically converted to proper screenshot objects.
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         template:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         isPublic:
 *           type: boolean
 *         isDefault:
 *           type: boolean
 *         description:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         version:
 *           type: number
 *         adminApproval:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [pending, approved, rejected]
 *             reviewedBy:
 *               type: string
 *             reviewedAt:
 *               type: string
 *               format: date-time
 *             comments:
 *               type: string
 *         personalInfo:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: object
 *             summary:
 *               type: string
 *         education:
 *           type: array
 *           items:
 *             type: object
 *         experiences:
 *           type: array
 *           items:
 *             type: object
 *         projects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               githubUrl:
 *                 type: string
 *               liveUrl:
 *                 type: string
 *               screenshots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     caption:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *         hobbies:
 *           type: array
 *           items:
 *             type: object
 *         socialMedia:
 *           type: array
 *           items:
 *             type: object
 *         languages:
 *           type: array
 *           items:
 *             type: object
 *         certifications:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Resumes
 *     description: Resume management endpoints
 */

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     summary: Get all resumes for current user
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Resumes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     summary: Get a specific resume
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     summary: Create a new resume
 *     description: Creates a new resume with automatic data type conversion. Screenshot URLs in projects are automatically converted to proper screenshot objects.
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - template
 *               - personalInfo
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               template:
 *                 type: string
 *               personalInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                   - phone
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Resume created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/{id}:
 *   put:
 *     summary: Update a resume
 *     description: Updates a resume with automatic data type conversion. Screenshot URLs in projects are automatically converted to proper screenshot objects.
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Resume updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/{id}:
 *   delete:
 *     summary: Delete a resume
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 */



// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const query = { user: req.user.id };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resumes = await Resume.find(query)
      .select('title template status isPublic isDefault description tags version createdAt updatedAt adminApproval')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resume.countDocuments(query);

    res.status(200).json({
      success: true,
      count: resumes.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: resumes
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
router.get('/:id', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resume'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
router.post('/', auth, resumeDataTypeMiddleware, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('template').notEmpty().withMessage('Template is required'),
  body('personalInfo.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('personalInfo.email').isEmail().withMessage('Please enter a valid email'),
  body('personalInfo.phone').notEmpty().withMessage('Phone number is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Remove _id if present to prevent duplicate key errors
    if (req.body._id) {
      delete req.body._id;
    }

    // Add user to req.body
    req.body.user = req.user.id;

    // If this is the first resume, make it default
    const existingResumes = await Resume.countDocuments({ user: req.user.id });
    if (existingResumes === 0) {
      req.body.isDefault = true;
    }

    const resume = await Resume.create(req.body);

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
router.put('/:id', auth, resumeDataTypeMiddleware, async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this resume'
      });
    }

    // Remove _id if present to prevent conflicts
    if (req.body._id) {
      delete req.body._id;
    }

    // Use findOneAndUpdate to ensure proper validation and middleware execution
    resume = await Resume.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this resume'
      });
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
router.post('/:id/duplicate', auth, async (req, res, next) => {
  try {
    const originalResume = await Resume.findById(req.params.id);

    if (!originalResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (originalResume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to duplicate this resume'
      });
    }

    // Create new resume with copied data
    const resumeData = originalResume.toObject();
    delete resumeData._id;
    delete resumeData.createdAt;
    delete resumeData.updatedAt;
    delete resumeData.version;
    delete resumeData.previousVersions;
    delete resumeData.adminApproval;
    
    // Ensure no _id field is present
    if (resumeData._id) {
      delete resumeData._id;
    }
    
    resumeData.title = `${originalResume.title} (Copy)`;
    resumeData.user = req.user.id;
    resumeData.status = 'draft';

    const newResume = await Resume.create(resumeData);

    res.status(201).json({
      success: true,
      data: newResume
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get available resume templates
// @route   GET /api/resumes/templates
// @access  Private
router.get('/templates', auth, async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean sidebar layout with dark theme',
        preview: '/templates/modern-preview.png',
        features: ['Professional layout', 'Color customization', 'Modern typography']
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Minimal and elegant blue theme design',
        preview: '/templates/professional-preview.png',
        features: ['Business standard', 'Conservative design', 'Wide compatibility']
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Creative design with gradient colors',
        preview: '/templates/creative-preview.png',
        features: ['Creative layout', 'Visual elements', 'Stand out design']
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional gray design with initials block',
        preview: '/templates/classic-preview.png',
        features: ['Traditional format', 'Widely accepted', 'Professional appearance']
      }
    ];

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload project screenshot
// @route   POST /api/resume/upload-screenshot
// @access  Private
router.post('/upload-screenshot', auth, upload.single('screenshot'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    let fileUrl;
    let publicId;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Cloudinary upload
      fileUrl = req.file.path; // Cloudinary returns the URL in path
      publicId = req.file.filename; // Cloudinary returns public_id in filename
    } else {
      // Local storage
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        publicId: publicId
      }
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && !process.env.CLOUDINARY_CLOUD_NAME && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * @swagger
 * /api/resumes/upload-screenshot:
 *   post:
 *     summary: Upload project screenshot
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               screenshot:
 *                 type: string
 *                 format: binary
 *                 description: Screenshot image file
 *     responses:
 *       200:
 *         description: Screenshot uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the uploaded screenshot
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     mimetype:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                       description: Cloudinary public ID (if using Cloudinary)
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/resumes/{id}/generate:
 *   post:
 *     summary: Generate PDF for a specific resume
 *     description: Generate a PDF version of the resume using the specified template with real database data
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               template:
 *                 type: string
 *                 enum: [ProfessionalTemplate, ModernTemplate, CreativeTemplate, ClassicTemplate]
 *                 default: ProfessionalTemplate
 *                 description: Template to use for PDF generation (optional, uses resume's template if not provided)
 *     responses:
 *       200:
 *         description: PDF generated successfully with real data
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User doesn't own this resume
 *       404:
 *         description: Resume not found
 *       500:
 *         description: Internal server error
 */

// @desc    Generate PDF for a specific resume
// @route   POST /api/resumes/:id/generate
// @access  Private
router.post('/:id/generate', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('user');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to generate this resume'
      });
    }

    const pdfGenerator = new SimplePDFGenerator();

    try {
      const templateName = req.body.template || resume.template || 'ProfessionalTemplate';
      
      const pdfBuffer = await pdfGenerator.generatePDF(resume, templateName);

      // Set response headers with better filename
      const filename = `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}-${templateName}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);

    } finally {
      // Close browser to free up resources
      await pdfGenerator.closeBrowser();
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * @swagger
 * /api/resumes/{id}/pdf:
 *   get:
 *     summary: Generate PDF for a specific resume
 *     description: Generate a PDF version of the resume using the specified template
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: [ProfessionalTemplate, ModernTemplate, CreativeTemplate, ClassicTemplate]
 *           default: ProfessionalTemplate
 *         description: Template to use for PDF generation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User doesn't own this resume
 *       404:
 *         description: Resume not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { template = 'ProfessionalTemplate' } = req.query;

    // Find the resume and check ownership
    const resume = await Resume.findById(id).populate('user');
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Check if user owns this resume or is admin
    if (resume.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pdfGenerator = new SimplePDFGenerator();

    try {
      const pdfBuffer = await pdfGenerator.generatePDF(resume, template);

      // Set response headers
      const filename = `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}-${template}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

    } finally {
      // Always close the browser
      await pdfGenerator.closeBrowser();
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * @swagger
 * /api/resumes/{id}/pdf/admin:
 *   get:
 *     summary: Generate PDF for any resume (Admin only)
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: [ProfessionalTemplate, ModernTemplate, CreativeTemplate, ClassicTemplate]
 *           default: ProfessionalTemplate
 *         description: Template to use for PDF generation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

// @desc    Generate PDF for any resume (Admin only)
// @route   GET /api/resumes/:id/pdf/admin
// @access  Admin
router.get('/:id/pdf/admin', auth, authorize('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { template = 'ProfessionalTemplate' } = req.query;

    // Find the resume
    const resume = await Resume.findById(id).populate('user');
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const pdfGenerator = new SimplePDFGenerator();

    try {
      const pdfBuffer = await pdfGenerator.generatePDF(resume, template);

      // Set response headers
      const filename = `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}-${template}-ADMIN.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

    } finally {
      // Always close the browser
      await pdfGenerator.closeBrowser();
    }

  } catch (error) {
    console.error('Admin PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * @swagger
 * /api/resumes/{id}/export/csv:
 *   get:
 *     summary: Export a specific resume as CSV
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Export a specific resume as CSV
// @route   GET /api/resumes/:id/export/csv
// @access  Private
router.get('/:id/export/csv', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to export this resume'
      });
    }

    // Convert resume to CSV format
    const csvData = convertResumeToCSV(resume);

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.title || 'resume'}.csv"`);

    // Send CSV data
    res.send(csvData);

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/resumes/{id}/export/json:
 *   get:
 *     summary: Export a specific resume as JSON
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JSON exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 */

// @desc    Export a specific resume as JSON
// @route   GET /api/resumes/:id/export/json
// @access  Private
router.get('/:id/export/json', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Make sure user owns resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to export this resume'
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.title || 'resume'}.json"`);

    // Send JSON data
    res.json(resume);

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/resumes/export/csv:
 *   get:
 *     summary: Export all resumes as CSV (bulk export)
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of resumes to export
 *     responses:
 *       200:
 *         description: CSV exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */

// @desc    Export all resumes as CSV (bulk export)
// @route   GET /api/resumes/export/csv
// @access  Private
router.get('/export/csv', auth, async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const query = { user: req.user.id };
    
    const resumes = await Resume.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));

    if (resumes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No resumes found to export'
      });
    }

    // Convert resumes to CSV format
    const csvData = convertResumesToCSV(resumes);

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="resumes_export_${new Date().toISOString().split('T')[0]}.csv"`);

    // Send CSV data
    res.send(csvData);

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/resumes/export/json:
 *   get:
 *     summary: Export all resumes as JSON (bulk export)
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of resumes to export
 *     responses:
 *       200:
 *         description: JSON exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 */

// @desc    Export all resumes as JSON (bulk export)
// @route   GET /api/resumes/export/json
// @access  Private
router.get('/export/json', auth, async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const query = { user: req.user.id };
    
    const resumes = await Resume.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit));

    if (resumes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No resumes found to export'
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="resumes_export_${new Date().toISOString().split('T')[0]}.json"`);

    // Send JSON data
    res.json({
      success: true,
      count: resumes.length,
      exportedAt: new Date().toISOString(),
      data: resumes
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to convert a single resume to CSV format
 */
function convertResumeToCSV(resume) {
  const headers = [
    'ID', 'Title', 'Template', 'Status', 'Is Public', 'Is Default', 'Description',
    'First Name', 'Last Name', 'Email', 'Phone', 'Address',
    'Summary', 'Created At', 'Updated At'
  ];

  const address = resume.personalInfo?.address || {};
  const addressStr = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(part => part && part !== 'undefined' && part !== 'null')
    .join(', ');

  const row = [
    resume._id,
    resume.title,
    resume.template,
    resume.status,
    resume.isPublic,
    resume.isDefault,
    resume.description,
    resume.personalInfo?.firstName,
    resume.personalInfo?.lastName,
    resume.personalInfo?.email,
    resume.personalInfo?.phone,
    addressStr,
    resume.personalInfo?.summary,
    resume.createdAt,
    resume.updatedAt
  ];

  // Escape CSV values
  const escapedRow = row.map(value => {
    if (value === null || value === undefined || value === 'undefined') return '';
    const stringValue = String(value);
    if (stringValue === 'undefined' || stringValue === 'null') return '';
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  });

  return headers.join(',') + '\n' + escapedRow.join(',');
}

/**
 * Helper function to convert multiple resumes to CSV format
 */
function convertResumesToCSV(resumes) {
  if (resumes.length === 0) return '';

  const headers = [
    'ID', 'Title', 'Template', 'Status', 'Is Public', 'Is Default', 'Description',
    'First Name', 'Last Name', 'Email', 'Phone', 'Address',
    'Summary', 'Created At', 'Updated At'
  ];

  const rows = resumes.map(resume => {
    const address = resume.personalInfo?.address || {};
    const addressStr = [address.street, address.city, address.state, address.zipCode, address.country]
      .filter(part => part && part !== 'undefined' && part !== 'null')
      .join(', ');

    const row = [
      resume._id,
      resume.title,
      resume.template,
      resume.status,
      resume.isPublic,
      resume.isDefault,
      resume.description,
      resume.personalInfo?.firstName,
      resume.personalInfo?.lastName,
      resume.personalInfo?.email,
      resume.personalInfo?.phone,
      addressStr,
      resume.personalInfo?.summary,
      resume.createdAt,
      resume.updatedAt
    ];

    // Escape CSV values
    return row.map(value => {
      if (value === null || value === undefined || value === 'undefined') return '';
      const stringValue = String(value);
      if (stringValue === 'undefined' || stringValue === 'null') return '';
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  return headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
}

module.exports = router;
