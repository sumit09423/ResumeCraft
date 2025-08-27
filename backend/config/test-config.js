// Test configuration for development
// This file contains test credentials and configurations for development

const testConfig = {
  // Test Cloudinary credentials (replace with your own for testing)
  cloudinary: {
    cloud_name: 'demo',
    api_key: 'demo',
    api_secret: 'demo'
  },
  
  // Test Gmail SMTP (replace with your own for testing)
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    user: 'test@gmail.com',
    pass: 'test-app-password'
  },
  
  // Test JWT secret
  jwt: {
    secret: 'test-jwt-secret-key-for-development-only',
    expire: '7d'
  },
  
  // Test MongoDB URI
  mongodb: {
    uri: 'mongodb://localhost:27017/resume_builder_test'
  }
};

module.exports = testConfig;
