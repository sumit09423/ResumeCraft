const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { userDataTypeMiddleware } = require('../utils/dataTypeConverter');
const { upload, deleteImage, uploadImage } = require('../config/cloudinary');

const router = express.Router();

// Fallback local storage for when Cloudinary is not configured
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use Cloudinary if configured, otherwise use local storage
const storage = process.env.CLOUDINARY_CLOUD_NAME ? 
  require('../config/cloudinary').storage : 
  localStorage;

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', auth, userDataTypeMiddleware, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('mobileNumber').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.zipCode').optional().trim()
], async (req, res, next) => {
  try {
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
    if (req.body.mobileNumber !== undefined) {
      fieldsToUpdate.mobileNumber = req.body.mobileNumber;
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

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: false // Disable validators during updates to prevent address validation errors
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
router.post('/profile-picture', auth, uploadMiddleware.single('profilePicture'), async (req, res, next) => {
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

    // Update user profile picture
    const user = await User.findByIdAndUpdate(req.user.id, { 
      profilePicture: fileUrl,
      profilePicturePublicId: publicId // Store Cloudinary public_id if available
    }, { new: true }).select('-password');

    res.status(200).json({
      success: true,
      data: {
        user: user,
        file: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          publicId: publicId
        }
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

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all resumes associated with the user
    const Resume = require('../models/Resume');
    await Resume.deleteMany({ user: req.user.id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/statistics
// @access  Private
router.get('/statistics', auth, async (req, res, next) => {
  try {
    const Resume = require('../models/Resume');
    
    const totalResumes = await Resume.countDocuments({ user: req.user.id });
    const draftResumes = await Resume.countDocuments({ user: req.user.id, status: 'draft' });
    const publishedResumes = await Resume.countDocuments({ user: req.user.id, status: 'published' });
    const archivedResumes = await Resume.countDocuments({ user: req.user.id, status: 'archived' });
    const pendingApproval = await Resume.countDocuments({ 
      user: req.user.id, 
      'adminApproval.status': 'pending' 
    });
    const approvedResumes = await Resume.countDocuments({ 
      user: req.user.id, 
      'adminApproval.status': 'approved' 
    });

    // Template usage
    const templateStats = await Resume.aggregate([
      { $match: { user: req.user._id } },
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
        totalResumes,
        draftResumes,
        publishedResumes,
        archivedResumes,
        pendingApproval,
        approvedResumes,
        templateStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
