const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CloudGuard API',
      version: '1.0.0',
      description: 'Cloud Resource Management & Monitoring API for CloudGuard platform',
      contact: {
        name: 'CloudGuard Team',
        email: 'admin@cloudguard.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'USER', 'VIEWER'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['EC2', 'S3', 'RDS', 'LAMBDA', 'ECS', 'EKS', 'CLOUDFRONT', 'VPC', 'OTHER'] },
            status: { type: 'string', enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN'] },
            region: { type: 'string' },
            description: { type: 'string' },
            cpuUsage: { type: 'number' },
            ramUsage: { type: 'number' },
          },
        },
        Access: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            resourceId: { type: 'string' },
            role: { type: 'string', enum: ['OWNER', 'EDITOR', 'VIEWER'] },
            grantedAt: { type: 'string', format: 'date-time' },
          },
        },
        Log: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            action: { type: 'string' },
            details: { type: 'string' },
            ipAddress: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsDoc(options);
