const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resume Builder API',
      version: '1.0.0',
      description: 'Resume builder API with authentication and file management',
      contact: {
        name: 'Resume Builder Team',
        email: 'support@resumebuilder.com'
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5001}`,
          description: 'Development server'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
