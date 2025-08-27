const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const convertDates = (data, dateFields = []) => {
  const result = { ...data };
  
  dateFields.forEach(fieldPath => {
    const keys = fieldPath.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] && typeof current[keys[i]] === 'object') {
        current = current[keys[i]];
      } else {
        return;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] && typeof current[lastKey] === 'string') {
      const date = new Date(current[lastKey]);
      if (!isNaN(date.getTime())) {
        current[lastKey] = date;
      }
    }
  });
  
  return result;
};

const convertNumbers = (data, numberFields = []) => {
  const result = { ...data };
  
  numberFields.forEach(fieldPath => {
    const keys = fieldPath.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] && typeof current[keys[i]] === 'object') {
        current = current[keys[i]];
      } else {
        return;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] && typeof current[lastKey] === 'string') {
      const num = parseFloat(current[lastKey]);
      if (!isNaN(num)) {
        current[lastKey] = num;
      }
    }
  });
  
  return result;
};

const convertObjectIds = (data, objectIdFields = []) => {
  const result = { ...data };
  
  objectIdFields.forEach(fieldPath => {
    const keys = fieldPath.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] && typeof current[keys[i]] === 'object') {
        current = current[keys[i]];
      } else {
        return;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] && typeof current[lastKey] === 'string' && ObjectId.isValid(current[lastKey])) {
      current[lastKey] = new ObjectId(current[lastKey]);
    }
  });
  
  return result;
};

const ensureArrays = (data, arrayFields = []) => {
  const result = { ...data };
  
  arrayFields.forEach(fieldPath => {
    const keys = fieldPath.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] && typeof current[keys[i]] === 'object') {
        current = current[keys[i]];
      } else {
        return;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] && !Array.isArray(current[lastKey])) {
      current[lastKey] = [];
    }
  });
  
  return result;
};

const convertCoordinates = (data) => {
  const result = { ...data };
  
  // Handle address coordinates
  if (result.address && result.address.coordinates) {
    if (typeof result.address.coordinates.lat === 'string') {
      result.address.coordinates.lat = parseFloat(result.address.coordinates.lat);
    }
    if (typeof result.address.coordinates.lng === 'string') {
      result.address.coordinates.lng = parseFloat(result.address.coordinates.lng);
    }
  }
  
  // Handle personalInfo address coordinates
  if (result.personalInfo && result.personalInfo.address && result.personalInfo.address.coordinates) {
    if (typeof result.personalInfo.address.coordinates.lat === 'string') {
      result.personalInfo.address.coordinates.lat = parseFloat(result.personalInfo.address.coordinates.lat);
    }
    if (typeof result.personalInfo.address.coordinates.lng === 'string') {
      result.personalInfo.address.coordinates.lng = parseFloat(result.personalInfo.address.coordinates.lng);
    }
  }
  
  return result;
};

const convertScreenshots = (data) => {
  const result = { ...data };
  
  // Handle screenshots in projects
  if (result.projects && Array.isArray(result.projects)) {
    result.projects.forEach(project => {
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
  
  return result;
};

const convertResumeData = (data) => {
  let result = { ...data };
  
  // Convert dates
  const dateFields = [
    'startDate',
    'endDate',
    'personalInfo.startDate',
    'personalInfo.endDate',
    'education.startDate',
    'education.endDate',
    'experiences.startDate',
    'experiences.endDate',
    'projects.startDate',
    'projects.endDate',
    'certifications.issueDate',
    'certifications.expiryDate',
    'adminApproval.reviewedAt'
  ];
  
  result = convertDates(result, dateFields);
  
  // Convert numbers
  const numberFields = [
    'education.gpa',
    'version'
  ];
  
  result = convertNumbers(result, numberFields);
  
  // Convert ObjectIds
  const objectIdFields = [
    'user',
    'adminApproval.reviewedBy'
  ];
  
  result = convertObjectIds(result, objectIdFields);
  
  // Ensure arrays
  const arrayFields = [
    'education',
    'experiences',
    'projects',
    'skills',
    'hobbies',
    'socialMedia',
    'languages',
    'certifications',
    'previousVersions'
  ];
  
  result = ensureArrays(result, arrayFields);
  
  // Convert coordinates
  result = convertCoordinates(result);
  
  // Convert screenshots
  result = convertScreenshots(result);
  
  return result;
};

const convertUserData = (data) => {
  let result = { ...data };
  
  // Convert dates
  const dateFields = [
    'emailVerificationExpire',
    'resetPasswordExpire',
    'lastLogin'
  ];
  
  result = convertDates(result, dateFields);
  
  // Convert coordinates
  result = convertCoordinates(result);
  
  return result;
};

const convertHobbyData = (data) => {
  let result = { ...data };
  
  // Convert ObjectIds
  const objectIdFields = ['user', 'resume'];
  result = convertObjectIds(result, objectIdFields);
  
  return result;
};

const convertSkillData = (data) => {
  let result = { ...data };
  
  // Convert numbers
  const numberFields = ['yearsOfExperience'];
  result = convertNumbers(result, numberFields);
  
  // Convert ObjectIds
  const objectIdFields = ['user', 'resume'];
  result = convertObjectIds(result, objectIdFields);
  
  return result;
};

const convertSocialMediaData = (data) => {
  let result = { ...data };
  
  // Convert numbers
  const numberFields = ['followers'];
  result = convertNumbers(result, numberFields);
  
  // Convert ObjectIds
  const objectIdFields = ['user', 'resume'];
  result = convertObjectIds(result, objectIdFields);
  
  return result;
};

const convertLanguageData = (data) => {
  let result = { ...data };
  
  // Convert ObjectIds
  const objectIdFields = ['user', 'resume'];
  result = convertObjectIds(result, objectIdFields);
  
  // Convert certification dates
  if (result.certification) {
    result.certification = convertDates(result.certification, ['issueDate', 'expiryDate']);
  }
  
  return result;
};

const convertCertificationData = (data) => {
  let result = { ...data };
  
  // Convert dates
  const dateFields = ['issueDate', 'expiryDate'];
  result = convertDates(result, dateFields);
  
  // Convert ObjectIds
  const objectIdFields = ['user', 'resume'];
  result = convertObjectIds(result, objectIdFields);
  
  return result;
};

const convertTemplateData = (data) => {
  let result = { ...data };
  
  // Convert numbers
  const numberFields = ['usageCount', 'rating.average', 'rating.count'];
  result = convertNumbers(result, numberFields);
  
  // Convert ObjectIds
  const objectIdFields = ['createdBy'];
  result = convertObjectIds(result, objectIdFields);
  
  return result;
};

const resumeDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    // Remove _id if present to prevent duplicate key errors
    if (req.body._id) {
      delete req.body._id;
    }
    req.body = convertResumeData(req.body);
  }
  next();
};

const userDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertUserData(req.body);
  }
  next();
};

const hobbyDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertHobbyData(req.body);
  }
  next();
};

const skillDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertSkillData(req.body);
  }
  next();
};

const socialMediaDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertSocialMediaData(req.body);
  }
  next();
};

const languageDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertLanguageData(req.body);
  }
  next();
};

const certificationDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertCertificationData(req.body);
  }
  next();
};

const templateDataTypeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = convertTemplateData(req.body);
  }
  next();
};

module.exports = {
  convertDates,
  convertNumbers,
  convertObjectIds,
  ensureArrays,
  convertCoordinates,
  convertScreenshots,
  convertResumeData,
  convertUserData,
  convertHobbyData,
  convertSkillData,
  convertSocialMediaData,
  convertLanguageData,
  convertCertificationData,
  convertTemplateData,
  resumeDataTypeMiddleware,
  userDataTypeMiddleware,
  hobbyDataTypeMiddleware,
  skillDataTypeMiddleware,
  socialMediaDataTypeMiddleware,
  languageDataTypeMiddleware,
  certificationDataTypeMiddleware,
  templateDataTypeMiddleware
};
