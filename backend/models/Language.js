const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const languageSchema = new mongoose.Schema({
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
    required: [true, 'Language name is required'],
    trim: true,
    maxlength: [50, 'Language name cannot exceed 50 characters']
  },
  proficiency: {
    type: String,
    enum: ['basic', 'conversational', 'fluent', 'native'],
    default: 'conversational'
  },
  isNative: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  certification: {
    name: String,
    level: String,
    issueDate: Date,
    expiryDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
languageSchema.index({ user: 1, resume: 1 });
languageSchema.index({ name: 1 });
languageSchema.index({ proficiency: 1 });
languageSchema.index({ isActive: 1 });

// Pre-save middleware to ensure proper data types
languageSchema.pre('save', function(next) {
  // Ensure user and resume are ObjectIds
  if (typeof this.user === 'string' && ObjectId.isValid(this.user)) {
    this.user = new ObjectId(this.user);
  }
  if (typeof this.resume === 'string' && ObjectId.isValid(this.resume)) {
    this.resume = new ObjectId(this.resume);
  }
  
  // Ensure certification dates are proper Date objects
  if (this.certification) {
    if (this.certification.issueDate && typeof this.certification.issueDate === 'string') {
      this.certification.issueDate = new Date(this.certification.issueDate);
    }
    if (this.certification.expiryDate && typeof this.certification.expiryDate === 'string') {
      this.certification.expiryDate = new Date(this.certification.expiryDate);
    }
  }
  
  next();
});

module.exports = mongoose.model('Language', languageSchema);
