const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    set: function(val) {
      // Ensure proper Date object conversion
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  },
  endDate: {
    type: Date,
    default: null, // null means current position
    set: function(val) {
      // Ensure proper Date object conversion
      if (val && typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  achievements: [{
    type: String,
    maxlength: [500, 'Achievement cannot exceed 500 characters'],
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true,
    required: true
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  technologies: [{
    type: String,
    required: [true, 'At least one technology is required'],
    trim: true
  }],
  githubUrl: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/,
      'Please enter a valid GitHub URL'
    ]
  },
  liveUrl: {
    type: String,
    match: [
      /^https?:\/\/.+/,
      'Please enter a valid URL'
    ]
  },
  screenshots: {
    type: [{
      url: {
        type: String,
        required: false
      },
      caption: {
        type: String,
        maxlength: [200, 'Caption cannot exceed 200 characters']
      },
      publicId: String, // For Cloudinary public ID
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    set: function(screenshots) {
      if (!screenshots) return screenshots;
      
      // If screenshots is an array, process each item
      if (Array.isArray(screenshots)) {
        return screenshots.map(screenshot => {
          // If it's already an object with url property, return as is
          if (typeof screenshot === 'object' && screenshot.url) {
            return screenshot;
          }
          // If it's a string (URL), convert to object
          if (typeof screenshot === 'string') {
            return {
              url: screenshot,
              caption: '',
              uploadedAt: new Date()
            };
          }
          // If it's an object without url, try to use it as is
          return screenshot;
        });
      }
      
      return screenshots;
    }
  },
  startDate: {
    type: Date,
    set: function(val) {
      if (val && typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  },
  endDate: {
    type: Date,
    set: function(val) {
      if (val && typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const hobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hobby name is required'],
    trim: true,
    maxlength: [50, 'Hobby name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: [true, 'Platform is required']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    match: [
      /^https?:\/\/.+/,
      'Please enter a valid URL'
    ]
  },
  username: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  template: {
    type: String,
    required: [true, 'Template is required'],
    default: 'modern'
  },
  templateConfig: {
    colors: {
      primary: { type: String, default: '#2563eb' },
      secondary: { type: String, default: '#64748b' },
      accent: { type: String, default: '#f59e0b' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#1f2937' }
    },
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' }
    },
    spacing: {
      sectionGap: { type: Number, default: 24 },
      itemGap: { type: Number, default: 16 }
    },
    layout: {
      sidebar: { type: Boolean, default: false },
      twoColumn: { type: Boolean, default: false },
      compact: { type: Boolean, default: false }
    }
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    summary: {
      type: String
    },
    profilePicture: String,
    profilePicturePublicId: String
  },
  education: [{
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true
    },
    field: {
      type: String,
      required: [true, 'Field of study is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      set: function(val) {
        if (typeof val === 'string') {
          return new Date(val);
        }
        return val;
      }
    },
    endDate: {
      type: Date,
      set: function(val) {
        if (val && typeof val === 'string') {
          return new Date(val);
        }
        return val;
      }
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    },
    description: String
  }],
  experiences: [experienceSchema],
  projects: [projectSchema],
  skills: [{
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    level: {
      type: String,
      default: 'intermediate'
    },
    category: {
      type: String,
      default: 'technical'
    }
  }],
  hobbies: [hobbySchema],
  socialMedia: [socialMediaSchema],
  languages: [{
    name: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true
    },
    proficiency: {
      type: String,
      default: 'conversational'
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true
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
    credentialId: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  adminApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ status: 1, 'adminApproval.status': 1 });
resumeSchema.index({ isPublic: 1 });
resumeSchema.index({ template: 1 });
resumeSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure proper data types
resumeSchema.pre('save', function(next) {
  // Ensure all dates are proper Date objects
  if (this.personalInfo && this.personalInfo.address && this.personalInfo.address.coordinates) {
    if (typeof this.personalInfo.address.coordinates.lat === 'string') {
      this.personalInfo.address.coordinates.lat = parseFloat(this.personalInfo.address.coordinates.lat);
    }
    if (typeof this.personalInfo.address.coordinates.lng === 'string') {
      this.personalInfo.address.coordinates.lng = parseFloat(this.personalInfo.address.coordinates.lng);
    }
  }

  // Handle screenshots conversion for projects
  if (this.projects && Array.isArray(this.projects)) {
    this.projects.forEach(project => {
      if (project.screenshots && Array.isArray(project.screenshots)) {
        project.screenshots = project.screenshots.map(screenshot => {
          // If it's already an object with url property, return as is
          if (typeof screenshot === 'object' && screenshot.url) {
            return screenshot;
          }
          // If it's a string (URL), convert to object
          if (typeof screenshot === 'string') {
            return {
              url: screenshot,
              caption: '',
              uploadedAt: new Date()
            };
          }
          // If it's an object without url, try to use it as is
          return screenshot;
        });
      }
    });
  }

  // Ensure arrays are properly formatted
  if (this.skills && !Array.isArray(this.skills)) {
    this.skills = [];
  }
  if (this.hobbies && !Array.isArray(this.hobbies)) {
    this.hobbies = [];
  }
  if (this.socialMedia && !Array.isArray(this.socialMedia)) {
    this.socialMedia = [];
  }
  if (this.languages && !Array.isArray(this.languages)) {
    this.languages = [];
  }
  if (this.certifications && !Array.isArray(this.certifications)) {
    this.certifications = [];
  }

  next();
});

// Pre-findOneAndUpdate middleware to handle screenshots conversion
resumeSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate();
  
  // Handle screenshots conversion in projects
  if (update.projects && Array.isArray(update.projects)) {
    update.projects.forEach(project => {
      if (project.screenshots && Array.isArray(project.screenshots)) {
        project.screenshots = project.screenshots.map(screenshot => {
          // If it's already an object with url property, return as is
          if (typeof screenshot === 'object' && screenshot.url) {
            return screenshot;
          }
          // If it's a string (URL), convert to object
          if (typeof screenshot === 'string') {
            return {
              url: screenshot,
              caption: '',
              uploadedAt: new Date()
            };
          }
          // If it's an object without url, try to use it as is
          return screenshot;
        });
      }
    });
  }
  
  // Handle $set operations
  if (update.$set && update.$set.projects && Array.isArray(update.$set.projects)) {
    update.$set.projects.forEach(project => {
      if (project.screenshots && Array.isArray(project.screenshots)) {
        project.screenshots = project.screenshots.map(screenshot => {
          if (typeof screenshot === 'object' && screenshot.url) {
            return screenshot;
          }
          if (typeof screenshot === 'string') {
            return {
              url: screenshot,
              caption: '',
              uploadedAt: new Date()
            };
          }
          return screenshot;
        });
      }
    });
  }
  
  next();
});

// Save previous version before updating
resumeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    const currentData = this.toObject();
    delete currentData._id;
    delete currentData.__v;
    delete currentData.createdAt;
    delete currentData.updatedAt;
    
    this.previousVersions.push({
      version: this.version,
      data: currentData
    });
    this.version += 1;
  }
  next();
});

// Virtual for full name
resumeSchema.virtual('personalInfo.fullName').get(function() {
  if (this.personalInfo) {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
  }
  return '';
});

// Virtual for experience duration
experienceSchema.virtual('duration').get(function() {
  if (!this.startDate) return '';
  
  const start = new Date(this.startDate);
  const end = this.endDate ? new Date(this.endDate) : new Date();
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
  }
  return `${months} month${months > 1 ? 's' : ''}`;
});

module.exports = mongoose.model('Resume', resumeSchema);
