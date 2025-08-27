const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { auth, isAdmin, isSuperAdmin } = require('../middleware/auth');
const { sendEmail, sendTemplatedEmail } = require('../utils/sendEmail');
// CSV generation without external dependency
const generateCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/admin-profiles/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin_profile_' + req.user.id + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid image file (JPEG, PNG, or GIF)'), false);
    }
  }
});

// Apply admin middleware to all routes
router.use(auth, isAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     Resume:
 *       type: object
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
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin]
 *         isActive:
 *           type: boolean
 *         isEmailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, super_admin]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // Build query
    let query = User.find().select('-password');
    
    // Create a separate query for counting total users (including filtered ones)
    let countQuery = User.find();

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchFilter = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      };
      query = query.find(searchFilter);
      countQuery = countQuery.find(searchFilter);
    }

    // Filter by role
    if (req.query.role) {
      query = query.find({ role: req.query.role });
      countQuery = countQuery.find({ role: req.query.role });
    }

    // Filter by status
    if (req.query.status) {
      if (req.query.status === 'active') {
        query = query.find({ isActive: true });
        countQuery = countQuery.find({ isActive: true });
      } else if (req.query.status === 'inactive') {
        query = query.find({ isActive: false });
        countQuery = countQuery.find({ isActive: false });
      }
    }

    // Sort
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortField]: sortOrder });

    // Pagination
    query = query.skip(startIndex).limit(limit);

    // Get total count of filtered results
    const total = await countQuery.countDocuments();

    const users = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a specific user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *               isActive:
 *                 type: boolean
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'super_admin']),
  body('isActive').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false // Disable validators during updates to prevent address validation errors
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       403:
 *         description: Cannot delete super admin
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    // Delete all resumes associated with the user
    await Resume.deleteMany({ user: req.params.id });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/users/bulk-delete:
 *   post:
 *     summary: Delete multiple users (admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       400:
 *         description: Invalid request - userIds array required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Bulk delete users
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
router.post('/users/bulk-delete', async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs to delete'
      });
    }

    // Delete associated resumes first
    await Resume.deleteMany({ user: { $in: userIds } });

    // Delete users
    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users and their resumes deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/resumes:
 *   get:
 *     summary: Get all resumes (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, name, or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *         description: Filter by template
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get all resumes (paginated)
// @route   GET /api/admin/resumes
// @access  Private/Admin
router.get('/resumes', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Resume.countDocuments();

    // Build query
    let query = Resume.find().populate('user', 'firstName lastName email');

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { title: searchRegex },
          { 'personalInfo.firstName': searchRegex },
          { 'personalInfo.lastName': searchRegex },
          { 'personalInfo.email': searchRegex }
        ]
      });
    }

    // Filter by status
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Filter by approval status
    if (req.query.approvalStatus) {
      query = query.find({ 'adminApproval.status': req.query.approvalStatus });
    }

    // Filter by template
    if (req.query.template) {
      query = query.find({ template: req.query.template });
    }

    // Sort
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortField]: sortOrder });

    // Pagination
    query = query.skip(startIndex).limit(limit);

    const resumes = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: resumes.length,
      pagination,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/resumes/{id}:
 *   get:
 *     summary: Get a specific resume (admin only)
 *     tags: [Admin]
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
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get single resume
// @route   GET /api/admin/resumes/:id
// @access  Private/Admin
router.get('/resumes/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
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

/**
 * @swagger
 * /api/admin/resumes/{id}/approve:
 *   put:
 *     summary: Approve or reject a resume (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Approval status
 *               comments:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional comments for the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume approval status updated successfully
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
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Approve/Reject resume
// @route   PUT /api/admin/resumes/:id/approve
// @access  Private/Admin
router.put('/resumes/:id/approve', [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('comments').optional().trim().isLength({ max: 500 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const resume = await Resume.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Ensure adminApproval object exists
    if (!resume.adminApproval) {
      resume.adminApproval = {};
    }

    console.log('Before update - status:', resume.status);
    console.log('Before update - adminApproval:', resume.adminApproval);
    console.log('Request body status:', req.body.status);

    // Update both the main status and adminApproval status
    resume.status = req.body.status;
    resume.adminApproval.status = req.body.status;
    resume.adminApproval.reviewedBy = req.user.id;
    resume.adminApproval.reviewedAt = new Date();
    resume.adminApproval.comments = req.body.comments;

    console.log('After update - status:', resume.status);
    console.log('After update - adminApproval:', resume.adminApproval);

    const savedResume = await resume.save();
    console.log('After save - status:', savedResume.status);
    console.log('After save - adminApproval:', savedResume.adminApproval);

    // Send email notification to user
    try {
      if (resume.user && resume.user.email) {
        await sendTemplatedEmail('resumeApproval', resume.user.email, resume.user.firstName, resume.title, req.body.status, req.body.comments);
      } else {
        console.log('Email notification skipped: User not found or email not available for resume:', resume._id);
      }
    } catch (emailError) {
      console.log('Email notification failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: savedResume
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/resumes/{id}:
 *   delete:
 *     summary: Delete a resume (admin only)
 *     tags: [Admin]
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
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Delete resume
// @route   DELETE /api/admin/resumes/:id
// @access  Private/Admin
router.delete('/resumes/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/resumes/bulk-delete:
 *   post:
 *     summary: Delete multiple resumes (admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeIds
 *             properties:
 *               resumeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of resume IDs to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       400:
 *         description: Invalid request - resumeIds array required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Bulk delete resumes
// @route   POST /api/admin/resumes/bulk-delete
// @access  Private/Admin
router.post('/resumes/bulk-delete', async (req, res, next) => {
  try {
    const { resumeIds } = req.body;

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of resume IDs to delete'
      });
    }

    // Delete resumes
    const result = await Resume.deleteMany({ _id: { $in: resumeIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} resumes deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/resumes/export/csv:
 *   get:
 *     summary: Export all resumes as CSV (Admin only)
 *     description: Generate a CSV file containing all resumes data for admin analysis
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived, pending, approved, rejected]
 *         description: Filter resumes by status
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: [modern, professional, creative, classic]
 *         description: Filter resumes by template
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter resumes created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter resumes created before this date (YYYY-MM-DD)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User is not admin
 *       500:
 *         description: Internal server error
 */
router.get('/resumes/export/csv', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, template, startDate, endDate } = req.query;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (template) filter.template = template;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Fetch resumes with user data
    const resumes = await Resume.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    if (resumes.length === 0) {
      return res.status(404).json({ error: 'No resumes found with the specified filters' });
    }

    // Prepare CSV data
    const csvData = resumes.map(resume => ({
      'Resume ID': resume._id.toString(),
      'Title': resume.title,
      'User Name': resume.user ? `${resume.user.firstName || ''} ${resume.user.lastName || ''}`.trim() : 'N/A',
      'User Email': resume.user?.email || 'N/A',
      'Template': resume.template,
      'Status': resume.status,
      'Created At': resume.createdAt.toISOString().split('T')[0],
      'Updated At': resume.updatedAt.toISOString().split('T')[0],
      'Personal Info - Name': `${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}`.trim(),
      'Personal Info - Email': resume.personalInfo?.email || '',
      'Personal Info - Phone': resume.personalInfo?.phone || '',
      'Experiences Count': resume.experiences?.length || 0,
      'Skills Count': resume.skills?.length || 0,
      'Projects Count': resume.projects?.length || 0,
      'Education Count': resume.education?.length || 0,
      'Is Public': resume.isPublic ? 'Yes' : 'No',
      'Is Default': resume.isDefault ? 'Yes' : 'No',
      'Version': resume.version || 1
    }));

    // Generate CSV content
    const csvContent = generateCSV(csvData);
    
    // Set response headers
    const filename = `resumes_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send CSV content
    res.send(csvContent);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

/**
 * @swagger
 * /api/admin/resumes/export/json:
 *   get:
 *     summary: Export all resumes as JSON (Admin only)
 *     description: Generate a JSON file containing all resumes data for admin analysis
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived, pending, approved, rejected]
 *         description: Filter resumes by status
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: [modern, professional, creative, classic]
 *         description: Filter resumes by template
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter resumes created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter resumes created before this date (YYYY-MM-DD)
 *       - in: query
 *         name: includeUserData
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include user data in the export
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JSON file generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResumes:
 *                   type: number
 *                 exportDate:
 *                   type: string
 *                   format: date-time
 *                 filters:
 *                   type: object
 *                 resumes:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User is not admin
 *       500:
 *         description: Internal server error
 */
router.get('/resumes/export/json', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, template, startDate, endDate, includeUserData = 'true' } = req.query;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (template) filter.template = template;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Fetch resumes
    let resumes;
    if (includeUserData === 'true') {
      resumes = await Resume.find(filter)
        .populate('user', 'firstName lastName email role')
        .sort({ createdAt: -1 });
    } else {
      resumes = await Resume.find(filter)
        .sort({ createdAt: -1 });
    }

    if (resumes.length === 0) {
      return res.status(404).json({ error: 'No resumes found with the specified filters' });
    }

    // Prepare JSON response
    const exportData = {
      totalResumes: resumes.length,
      exportDate: new Date().toISOString(),
      filters: {
        status: status || 'all',
        template: template || 'all',
        startDate: startDate || null,
        endDate: endDate || null,
        includeUserData: includeUserData === 'true'
      },
      resumes: resumes.map(resume => {
        const resumeData = resume.toObject();
        
        // Convert ObjectIds to strings
        resumeData._id = resumeData._id.toString();
        if (resumeData.user) {
          resumeData.user._id = resumeData.user._id.toString();
        }
        
        return resumeData;
      })
    };

    // Set response headers
    const filename = `resumes_export_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send JSON response
    res.json(exportData);

  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ error: 'Failed to generate JSON export' });
  }
});


/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalResumes = await Resume.countDocuments();
    const pendingResumes = await Resume.countDocuments({ 'adminApproval.status': 'pending' });
    const approvedResumes = await Resume.countDocuments({ 'adminApproval.status': 'approved' });
    const publishedResumes = await Resume.countDocuments({ status: 'published' });

    // Recent activities
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(5)
      .select('firstName lastName email createdAt');

    const recentResumes = await Resume.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .limit(5)
      .select('title status template createdAt');

    // Template usage statistics
    const templateStats = await Resume.aggregate([
      {
        $group: {
          _id: '$template',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          activeUsers,
          totalResumes,
          pendingResumes,
          approvedResumes,
          publishedResumes
        },
        recentUsers,
        recentResumes,
        templateStats
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/export:
 *   get:
 *     summary: Export data (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, resumes, all]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
// @desc    Export data
// @route   GET /api/admin/export
// @access  Private/Admin
router.get('/export', async (req, res, next) => {
  try {
    const { type = 'all' } = req.query;

    let exportData = {};

    if (type === 'users' || type === 'all') {
      const users = await User.find().select('-password');
      exportData.users = users;
    }

    if (type === 'resumes' || type === 'all') {
      const resumes = await Resume.find().populate('user', 'firstName lastName email');
      exportData.resumes = resumes;
    }

    res.status(200).json({
      success: true,
      data: exportData,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/admins:
 *   post:
 *     summary: Create a new admin (super admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin created successfully
 */
// @desc    Create new admin (super admin only)
// @route   POST /api/admin/admins
// @access  Private/Super Admin
router.post('/admins', isSuperAdmin, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create admin user
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'admin',
      isEmailVerified: true // Admins are auto-verified
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/admins/{id}/role:
 *   put:
 *     summary: Update admin role (super admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin role updated successfully
 */
// @desc    Update admin role (super admin only)
// @route   PUT /api/admin/admins/:id/role
// @access  Private/Super Admin
router.put('/admins/:id/role', isSuperAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or super_admin'
      });
    }

    const admin = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin role updated successfully',
      data: admin
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
router.get('/profile', auth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const admin = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               mobileNumber:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 description: URL of the profile picture
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('mobileNumber').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please enter a valid international mobile number'),
  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL')
], async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const fieldsToUpdate = {};

    // Only add fields that are actually provided in the request
    if (req.body.firstName !== undefined) {
      fieldsToUpdate.firstName = req.body.firstName;
    }
    if (req.body.lastName !== undefined) {
      fieldsToUpdate.lastName = req.body.lastName;
    }
    if (req.body.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user'
        });
      }
      fieldsToUpdate.email = req.body.email;
    }
    if (req.body.mobileNumber !== undefined) {
      fieldsToUpdate.mobileNumber = req.body.mobileNumber;
    }
    if (req.body.profilePicture !== undefined) {
      fieldsToUpdate.profilePicture = req.body.profilePicture;
    }

    // Handle address fields individually - only update provided address fields
    if (req.body.address) {
      if (req.body.address.street !== undefined) {
        fieldsToUpdate['address.street'] = req.body.address.street;
      }
      if (req.body.address.city !== undefined) {
        fieldsToUpdate['address.city'] = req.body.address.city;
      }
      if (req.body.address.state !== undefined) {
        fieldsToUpdate['address.state'] = req.body.address.state;
      }
      if (req.body.address.country !== undefined) {
        fieldsToUpdate['address.country'] = req.body.address.country;
      }
      if (req.body.address.zipCode !== undefined) {
        fieldsToUpdate['address.zipCode'] = req.body.address.zipCode;
      }
      if (req.body.address.coordinates !== undefined) {
        fieldsToUpdate['address.coordinates'] = req.body.address.coordinates;
      }
    }

    const admin = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: admin
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/profile/password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Current password is incorrect
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Change admin password
// @route   PUT /api/admin/profile/password
// @access  Private/Admin
router.put('/profile/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const admin = await User.findById(req.user.id);

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Admin password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/profile/activity:
 *   get:
 *     summary: Get admin activity log
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities per page
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin activity log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       action:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       details:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Get admin activity log
// @route   GET /api/admin/profile/activity
// @access  Private/Admin
router.get('/profile/activity', auth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // For now, return a placeholder activity log
    // In a real application, you would have an Activity model to track admin actions
    const mockActivities = [
      {
        action: 'User Management',
        timestamp: new Date().toISOString(),
        details: { action: 'Viewed user list', userId: 'sample' }
      },
      {
        action: 'Resume Management',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: { action: 'Exported resumes to CSV', count: 25 }
      },
      {
        action: 'Profile Update',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        details: { action: 'Updated profile information' }
      }
    ];

    // Simulate pagination
    const totalActivities = mockActivities.length;
    const activities = mockActivities.slice(startIndex, startIndex + limit);

    const pagination = {};
    if (startIndex + limit < totalActivities) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: activities.length,
      pagination,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});
/**
 * @swagger
 * /api/admin/profile/upload-photo:
 *   post:
 *     summary: Upload admin profile photo
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file (image)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     profilePicture:
 *                       type: string
 *                       format: uri
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
// @desc    Upload admin profile photo
// @route   POST /api/admin/profile/upload-photo
// @access  Private/Admin
router.post('/profile/upload-photo', auth, uploadMiddleware.single('profilePhoto'), async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a profile photo'
      });
    }

    let photoUrl;

    // Upload to Cloudinary (if configured) or use local path
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'admin-profiles',
        public_id: req.file.filename.split('.')[0],
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto' }
        ]
      });

      photoUrl = result.secure_url;

      // Clean up local file after Cloudinary upload
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } else {
      // Use local file path
      photoUrl = `${req.protocol}://${req.get('host')}/uploads/admin-profiles/${req.file.filename}`;
    }

    // Update admin profile with new photo URL
    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: photoUrl },
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePicture: photoUrl,
        admin: admin
      }
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo'
    });
  }
});

module.exports = router;
