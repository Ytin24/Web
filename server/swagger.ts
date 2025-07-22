import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Tsvetokraft API',
    version: '1.0.0',
    description: 'Comprehensive API for Tsvetokraft flower shop website management',
    contact: {
      name: 'API Support',
      email: 'api@tsvetokraft.ru'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for user authentication'
      },
      ApiKeyAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        description: 'API token for external service integration (starts with tk_)'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'admin' },
          role: { type: 'string', enum: ['super_admin', 'manager'], example: 'super_admin' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastLogin: { type: 'string', format: 'date-time' }
        }
      },
      Section: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'hero' },
          title: { type: 'string', example: 'Создаем моменты красоты' },
          description: { type: 'string' },
          content: { type: 'string' },
          imageUrl: { type: 'string', example: '/api/images/hero-flowers-1.svg' },
          isActive: { type: 'boolean', example: true }
        }
      },
      BlogPost: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Свадебные букеты 2024' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          imageUrl: { type: 'string' },
          category: { type: 'string', example: 'wedding' },
          isPublished: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      PortfolioItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Свадебный букет "Нежность"' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
          category: { type: 'string', enum: ['wedding', 'corporate', 'birthday', 'seasonal'] },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CallbackRequest: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Иван Петров' },
          phone: { type: 'string', example: '+7 999 123-45-67' },
          message: { type: 'string' },
          callTime: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'contacted', 'completed'], example: 'pending' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      LoyaltyProgram: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          level: { type: 'string', enum: ['beginner', 'silver', 'gold', 'platinum'] },
          title: { type: 'string', example: 'Новичок' },
          description: { type: 'string' },
          minAmount: { type: 'integer', example: 0 },
          maxAmount: { type: 'integer' },
          discount: { type: 'integer', example: 5 },
          benefits: { type: 'string' },
          isActive: { type: 'boolean', example: true }
        }
      },
      ApiToken: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          token: { type: 'string', example: 'tk_abc123_xyz789' },
          name: { type: 'string', example: 'N8N Integration Token' },
          permissions: { type: 'string', example: '["read", "write"]' },
          expiresAt: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          lastUsed: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' },
          details: { type: 'string' }
        }
      },
      WebhookPayload: {
        type: 'object',
        properties: {
          event: { type: 'string', example: 'callback.created' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
          source: { type: 'string', example: 'tsvetokraft-website' }
        }
      }
    }
  },
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./server/routes.ts', './server/auth-routes.ts', './server/webhooks.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI endpoint
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Tsvetokraft API Documentation'
  }));
  
  // JSON spec endpoint
  app.get('/api/docs/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// API Documentation annotations for routes
export const apiDocs = {
  // Auth endpoints
  login: {
    tags: ['Authentication'],
    summary: 'User login',
    description: 'Authenticate user and return JWT token',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: { type: 'string', example: 'admin' },
              password: { type: 'string', example: 'password' }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      },
      401: { description: 'Invalid credentials' }
    }
  },
  
  // Sections endpoints
  getSections: {
    tags: ['Sections'],
    summary: 'Get all sections',
    description: 'Retrieve all website sections',
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    responses: {
      200: {
        description: 'Sections retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Section' }
            }
          }
        }
      }
    }
  },
  
  // Webhook endpoints
  registerWebhook: {
    tags: ['Webhooks'],
    summary: 'Register webhook for N8N integration',
    description: 'Register a webhook URL to receive event notifications',
    security: [{ BearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'url', 'events'],
            properties: {
              name: { type: 'string', example: 'telegram_bot' },
              url: { type: 'string', example: 'https://n8n.example.com/webhook/callback' },
              events: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['callback.created', 'order.created']
              },
              secret: { type: 'string', example: 'webhook_secret_key' }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Webhook registered successfully' },
      400: { description: 'Invalid webhook configuration' }
    }
  }
};