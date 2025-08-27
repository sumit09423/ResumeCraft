const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Template name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Template slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Template description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Template category is required'],
    enum: ['professional', 'creative', 'minimal', 'modern', 'classic', 'tech', 'elegant'],
    default: 'professional'
  },
  thumbnail: {
    type: String,
    required: [true, 'Template thumbnail is required']
  },
  preview: {
    type: String,
    required: [true, 'Template preview is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  defaultConfig: {
    colors: {
      primary: { type: String, default: '#2563eb' },
      secondary: { type: String, default: '#64748b' },
      accent: { type: String, default: '#f59e0b' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#1f2937' },
      border: { type: String, default: '#e5e7eb' }
    },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' },
      size: {
        heading: { type: String, default: '2xl' },
        subheading: { type: String, default: 'lg' },
        body: { type: String, default: 'base' }
      }
    },
    spacing: {
      sectionGap: { type: Number, default: 24 },
      itemGap: { type: Number, default: 16 },
      margin: { type: Number, default: 20 }
    },
    layout: {
      sidebar: { type: Boolean, default: false },
      twoColumn: { type: Boolean, default: false },
      compact: { type: Boolean, default: false },
      showPhoto: { type: Boolean, default: true },
      showIcons: { type: Boolean, default: true }
    },
    sections: {
      personalInfo: { type: Boolean, default: true },
      summary: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      languages: { type: Boolean, default: true },
      hobbies: { type: Boolean, default: true },
      socialMedia: { type: Boolean, default: true }
    }
  },
  features: [{
    name: { type: String, required: true },
    description: { type: String },
    isEnabled: { type: Boolean, default: true }
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
templateSchema.index({ slug: 1 });
templateSchema.index({ category: 1 });
templateSchema.index({ isActive: 1 });
templateSchema.index({ isPremium: 1 });
templateSchema.index({ usageCount: -1 });
templateSchema.index({ 'rating.average': -1 });

// Pre-save middleware to ensure proper data types
templateSchema.pre('save', function(next) {
  // Ensure createdBy is ObjectId
  if (this.createdBy && typeof this.createdBy === 'string' && ObjectId.isValid(this.createdBy)) {
    this.createdBy = new ObjectId(this.createdBy);
  }
  next();
});

// Virtual for full template name
templateSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.category})`;
});

// Static method to get popular templates
templateSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, 'rating.average': -1 })
    .limit(limit);
};

// Static method to get templates by category
templateSchema.statics.getByCategory = function(category, limit = 20) {
  return this.find({ category, isActive: true })
    .sort({ usageCount: -1 })
    .limit(limit);
};

// Instance method to increment usage count
templateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Instance method to add rating
templateSchema.methods.addRating = function(rating) {
  const totalRating = this.rating.average * this.rating.count + rating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);
