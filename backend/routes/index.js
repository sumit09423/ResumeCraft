const express = require('express');
const { auth } = require('../middleware/auth');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const resumeRoutes = require('./resumes');
const adminRoutes = require('./admin');
const uploadRoutes = require('./upload');
const templateRoutes = require('./templates');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', auth, userRoutes);
  app.use('/api/resumes', auth, resumeRoutes);
  app.use('/api/admin', auth, adminRoutes);
  app.use('/api/upload', auth, uploadRoutes);
  app.use('/api/templates', templateRoutes);

  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Resume Builder API is running',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/', (req, res) => {
    res.json({ 
      message: 'Resume Builder API',
      version: '1.0.0',
      documentation: '/api/docs'
    });
  });
};

module.exports = setupRoutes;
