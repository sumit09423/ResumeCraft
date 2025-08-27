const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const certificationSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resume: {
    type: ObjectId,
    ref: 'Resume',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    maxlength: [200, 'Certification name cannot exceed 200 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
    maxlength: [100, 'Issuer name cannot exceed 100 characters']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    set: function(val) {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  },
  expiryDate: {
    type: Date,
    set: function(val) {
      if (val && typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: [100, 'Credential ID cannot exceed 100 characters']
  },
  url: {
    type: String,
    match: [
      /^https?:\/\/.+/,
      'Please enter a valid URL'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['technical', 'professional', 'academic', 'other'],
    default: 'technical'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
certificationSchema.index({ user: 1, resume: 1 });
certificationSchema.index({ issuer: 1 });
certificationSchema.index({ category: 1 });
certificationSchema.index({ isActive: 1 });
certificationSchema.index({ issueDate: -1 });

// Pre-save middleware to ensure proper data types
certificationSchema.pre('save', function(next) {
  // Ensure user and resume are ObjectIds
  if (typeof this.user === 'string' && ObjectId.isValid(this.user)) {
    this.user = new ObjectId(this.user);
  }
  if (typeof this.resume === 'string' && ObjectId.isValid(this.resume)) {
    this.resume = new ObjectId(this.resume);
  }
  next();
});

module.exports = mongoose.model('Certification', certificationSchema);
