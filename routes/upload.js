const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
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

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
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
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { 
      profilePicture: fileUrl,
      profilePicturePublicId: publicId // Store Cloudinary public_id if available
    });

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

// @desc    Upload project screenshot
// @route   POST /api/upload/project-screenshot
// @access  Private
router.post('/project-screenshot', auth, uploadMiddleware.single('screenshot'), async (req, res, next) => {
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

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', auth, uploadMiddleware.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let fileUrl;
      let publicId;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Cloudinary upload
        fileUrl = file.path; // Cloudinary returns the URL in path
        publicId = file.filename; // Cloudinary returns public_id in filename
      } else {
        // Local storage
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }

      uploadedFiles.push({
        url: fileUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        publicId: publicId
      });
    }

    res.status(200).json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files && !process.env.CLOUDINARY_CLOUD_NAME) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', auth, async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Delete from Cloudinary
      try {
        await deleteImage(publicId);
      } catch (cloudinaryError) {
        console.log('Cloudinary delete error:', cloudinaryError);
      }
    } else {
      // Delete local file
      const filePath = path.join('uploads', publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get upload statistics
// @route   GET /api/upload/stats
// @access  Private
router.get('/stats', auth, async (req, res, next) => {
  try {
    const uploadDir = 'uploads/';
    let totalFiles = 0;
    let totalSize = 0;

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      totalFiles = files.length;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalFiles,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
// @desc    Upload a file (generic)
// @route   POST /api/upload
// @access  Private
router.post('/', auth, uploadMiddleware.single('file'), async (req, res, next) => {
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
      fileUrl = req.file.path;
      publicId = req.file.filename;
    } else {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        publicId: publicId
      }
    });
  } catch (error) {
    if (req.file && !process.env.CLOUDINARY_CLOUD_NAME && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', auth, uploadMiddleware.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let fileUrl;
      let publicId;

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        fileUrl = file.path;
        publicId = file.filename;
      } else {
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      }

      uploadedFiles.push({
        url: fileUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        publicId: publicId
      });
    }

    res.status(200).json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    if (req.files && !process.env.CLOUDINARY_CLOUD_NAME) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
});

/**
 * @swagger
 * /api/upload/{key}/info:
 *   get:
 *     summary: Get file information
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *       404:
 *         description: File not found
 */
// @desc    Get file information
// @route   GET /api/upload/:key/info
// @access  Private
router.get('/:key/info', auth, async (req, res, next) => {
  try {
    const { key } = req.params;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // For Cloudinary, we can get some basic info
      res.status(200).json({
        success: true,
        data: {
          publicId: key,
          storage: 'cloudinary',
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${key}`
        }
      });
    } else {
      // For local storage, check if file exists
      const filePath = path.join('uploads', key);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        res.status(200).json({
          success: true,
          data: {
            filename: key,
            storage: 'local',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `${req.protocol}://${req.get('host')}/uploads/${key}`
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
