import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertSectionSchema, insertBlogPostSchema, insertPortfolioItemSchema, 
  insertCallbackRequestSchema, insertLoyaltyProgramSchema, insertImageSchema
} from "@shared/schema";
import { 
  authenticateToken, 
  requireRole, 
  validateInput, 
  rateLimit, 
  securityHeaders,
  type AuthRequest 
} from "./auth";
import { setupAuthRoutes } from "./auth-routes";
import { createTokenRoutes, apiTokenAuth } from "./token-routes";
import { 
  registerWebhookEndpoint, 
  testWebhookEndpoint, 
  n8nApiEndpoint,
  n8nIntegration,
  initializeDefaultWebhooks 
} from "./webhooks";
import { setupSwagger } from "./swagger";
import { injectYandexScripts, yandexIntegration } from "./yandex";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply security middleware
  app.use(securityHeaders);
  app.use(injectYandexScripts);
  
  // Setup authentication routes
  setupAuthRoutes(app);
  
  // Setup token management routes (protected by JWT auth)
  app.use('/api', createTokenRoutes(storage));
  
  // Setup API documentation
  setupSwagger(app);
  
  // Initialize webhooks
  await initializeDefaultWebhooks();

  /**
   * @swagger
   * /api/config:
   *   get:
   *     tags: [Configuration]
   *     summary: Get public configuration
   *     description: Get public configuration for frontend (maps, analytics, etc.)
   *     responses:
   *       200:
   *         description: Public configuration
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 maps:
   *                   type: object
   *                   properties:
   *                     hasApiKey:
   *                       type: boolean
   *                     config:
   *                       type: object
   *                 metrics:
   *                   type: object
   *                   properties:
   *                     hasCounterId:
   *                       type: boolean
   */
  app.get("/api/config", (req, res) => {
    res.json({
      maps: {
        hasApiKey: !!process.env.YANDEX_MAPS_API_KEY,
        config: yandexIntegration.getMapConfig()
      },
      metrics: {
        hasCounterId: !!process.env.YANDEX_METRICS_COUNTER_ID
      }
    });
  });

  // Public routes (no authentication required)

  /**
   * @swagger
   * /api/sections:
   *   get:
   *     tags: [Sections]
   *     summary: Get all sections (public)
   *     description: Retrieve all active website sections for public display
   *     responses:
   *       200:
   *         description: Sections retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Section'
   */
  app.get("/api/sections", rateLimit(60 * 1000, 60), async (req, res) => {
    try {
      const sections = await storage.getAllSections();
      // Filter only active sections for public API
      const activeSections = sections.filter(s => s.isActive);
      res.json(activeSections);
    } catch (error) {
      console.error('Get sections error:', error);
      res.status(500).json({ error: "Failed to fetch sections" });
    }
  });

  // Protected admin routes
  
  /**
   * @swagger
   * /api/admin/sections:
   *   get:
   *     tags: [Sections Admin]
   *     summary: Get all sections (admin)
   *     description: Retrieve all website sections including inactive ones (requires authentication)
   *     security:
   *       - BearerAuth: []
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: Sections retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Section'
   */
  app.get("/api/admin/sections", 
    authenticateToken, 
    requireRole(['super_admin', 'manager']), 
    async (req: AuthRequest, res) => {
      try {
        const sections = await storage.getAllSections();
        res.json(sections);
      } catch (error) {
        console.error('Get admin sections error:', error);
        res.status(500).json({ error: "Failed to fetch sections" });
      }
    }
  );

  app.get("/api/sections/:name", async (req, res) => {
    try {
      const section = await storage.getSectionByName(req.params.name);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch section" });
    }
  });

  app.put("/api/sections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSectionSchema.partial().parse(req.body);
      const updatedSection = await storage.updateSection(id, validatedData);
      res.json(updatedSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid section data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.post("/api/sections", async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid section data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  // Blog posts routes
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const published = req.query.published === 'true';
      const blogPosts = published ? 
        await storage.getPublishedBlogPosts() : 
        await storage.getAllBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blogPost = await storage.getBlogPost(id);
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(blogPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const blogPost = await storage.createBlogPost(validatedData);
      res.status(201).json(blogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const updatedBlogPost = await storage.updateBlogPost(id, validatedData);
      res.json(updatedBlogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Portfolio items routes
  app.get("/api/portfolio-items", async (req, res) => {
    try {
      const { category, active } = req.query;
      let portfolioItems;
      
      if (category) {
        portfolioItems = await storage.getPortfolioItemsByCategory(category as string);
      } else if (active === 'true') {
        portfolioItems = await storage.getActivePortfolioItems();
      } else {
        portfolioItems = await storage.getAllPortfolioItems();
      }
      
      res.json(portfolioItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/portfolio-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const portfolioItem = await storage.getPortfolioItem(id);
      if (!portfolioItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      res.json(portfolioItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.post("/api/portfolio-items", async (req, res) => {
    try {
      const validatedData = insertPortfolioItemSchema.parse(req.body);
      const portfolioItem = await storage.createPortfolioItem(validatedData);
      res.status(201).json(portfolioItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid portfolio item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.put("/api/portfolio-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPortfolioItemSchema.partial().parse(req.body);
      const updatedPortfolioItem = await storage.updatePortfolioItem(id, validatedData);
      res.json(updatedPortfolioItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid portfolio item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/portfolio-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePortfolioItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  // Callback requests routes
  app.get("/api/callback-requests", async (req, res) => {
    try {
      const callbackRequests = await storage.getAllCallbackRequests();
      res.json(callbackRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch callback requests" });
    }
  });

  app.post("/api/callback-requests", async (req, res) => {
    try {
      const validatedData = insertCallbackRequestSchema.parse(req.body);
      const callbackRequest = await storage.createCallbackRequest(validatedData);
      res.status(201).json(callbackRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid callback request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create callback request" });
    }
  });

  app.put("/api/callback-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'contacted', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateCallbackRequest(id, { status } as any);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update callback request status" });
    }
  });

  app.delete("/api/callback-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCallbackRequest(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete callback request" });
    }
  });

  // Loyalty program routes
  app.get("/api/loyalty-program", async (req, res) => {
    try {
      const active = req.query.active === 'true';
      const loyaltyLevels = active ? 
        await storage.getActiveLoyaltyLevels() : 
        await storage.getAllLoyaltyLevels();
      res.json(loyaltyLevels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loyalty program" });
    }
  });

  app.put("/api/loyalty-program/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLoyaltyProgramSchema.partial().parse(req.body);
      const updatedLevel = await storage.updateLoyaltyLevel(id, validatedData);
      res.json(updatedLevel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loyalty program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update loyalty program" });
    }
  });

  // Images routes
  app.get("/api/images", async (req, res) => {
    try {
      const category = req.query.category as string;
      const images = category ? 
        await storage.getImagesByCategory(category) : 
        await storage.getAllImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  app.get("/api/images/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const image = await storage.getImageByFilename(filename);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Generate SVG based on category and filename
      const svg = generateSVG(image.category, filename, image.altText || image.description || '');
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(svg);
    } catch (error) {
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// SVG generation function
function generateSVG(category: string, filename: string, altText: string = ''): string {
  const colors = {
    hero: { primary: '#6B73FF', secondary: '#FF6B9D', accent: '#FFD93D' },
    about: { primary: '#4F46E5', secondary: '#EC4899', accent: '#10B981' },
    portfolio: { primary: '#8B5CF6', secondary: '#F59E0B', accent: '#EF4444' },
    blog: { primary: '#059669', secondary: '#DC2626', accent: '#7C3AED' },
    loyalty: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' },
    general: { primary: '#6B7280', secondary: '#9CA3AF', accent: '#D1D5DB' }
  };

  const colorSet = colors[category as keyof typeof colors] || colors.general;
  
  if (filename.includes('hero')) {
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorSet.primary};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${colorSet.secondary};stop-opacity:0.6" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#heroGrad)" />
        
        <!-- Flower petals -->
        <g transform="translate(400,300)">
          <ellipse cx="-80" cy="-40" rx="60" ry="20" fill="${colorSet.accent}" opacity="0.8" transform="rotate(-30)" />
          <ellipse cx="80" cy="-40" rx="60" ry="20" fill="${colorSet.secondary}" opacity="0.8" transform="rotate(30)" />
          <ellipse cx="0" cy="-80" rx="60" ry="20" fill="${colorSet.primary}" opacity="0.8" />
          <ellipse cx="-40" cy="60" rx="60" ry="20" fill="${colorSet.accent}" opacity="0.8" transform="rotate(-60)" />
          <ellipse cx="40" cy="60" rx="60" ry="20" fill="${colorSet.secondary}" opacity="0.8" transform="rotate(60)" />
          <circle cx="0" cy="0" r="25" fill="#FFF" opacity="0.9" />
        </g>
        
        <!-- Decorative elements -->
        <circle cx="150" cy="100" r="8" fill="${colorSet.accent}" opacity="0.6" />
        <circle cx="650" cy="500" r="12" fill="${colorSet.primary}" opacity="0.5" />
        <circle cx="100" cy="450" r="6" fill="${colorSet.secondary}" opacity="0.7" />
        
        <text x="400" y="550" font-family="Arial" font-size="14" text-anchor="middle" fill="#333" opacity="0.6">${altText}</text>
      </svg>
    `;
  } else if (filename.includes('portfolio-wedding')) {
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F8FAFC" />
        
        <!-- Wedding bouquet -->
        <g transform="translate(400,350)">
          <!-- Roses -->
          <g>
            <circle cx="-40" cy="-60" r="35" fill="${colorSet.primary}" opacity="0.9" />
            <circle cx="40" cy="-60" r="35" fill="${colorSet.secondary}" opacity="0.9" />
            <circle cx="0" cy="-20" r="40" fill="${colorSet.primary}" opacity="0.8" />
            <circle cx="-70" cy="20" r="30" fill="${colorSet.accent}" opacity="0.9" />
            <circle cx="70" cy="20" r="30" fill="${colorSet.secondary}" opacity="0.9" />
          </g>
          
          <!-- Stems -->
          <rect x="-5" y="60" width="10" height="120" fill="#10B981" />
          
          <!-- Leaves -->
          <ellipse cx="-20" cy="80" rx="15" ry="8" fill="#059669" opacity="0.8" />
          <ellipse cx="25" cy="100" rx="15" ry="8" fill="#059669" opacity="0.8" />
          
          <!-- Ribbon -->
          <rect x="-30" y="140" width="60" height="20" fill="${colorSet.accent}" opacity="0.7" />
        </g>
        
        <text x="400" y="570" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  } else if (filename.includes('portfolio-corporate')) {
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="corpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F3F4F6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#corpGrad)" />
        
        <!-- Corporate arrangement -->
        <g transform="translate(400,300)">
          <!-- Geometric flower arrangement -->
          <rect x="-100" y="-80" width="200" height="20" fill="${colorSet.primary}" opacity="0.8" />
          <rect x="-80" y="-60" width="160" height="20" fill="${colorSet.secondary}" opacity="0.8" />
          <rect x="-60" y="-40" width="120" height="20" fill="${colorSet.accent}" opacity="0.8" />
          <rect x="-40" y="-20" width="80" height="20" fill="${colorSet.primary}" opacity="0.8" />
          
          <!-- Vase -->
          <rect x="-30" y="0" width="60" height="80" fill="#374151" opacity="0.9" />
        </g>
        
        <text x="400" y="570" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  } else if (filename.includes('portfolio-birthday')) {
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#FEF3C7" />
        
        <!-- Birthday bouquet -->
        <g transform="translate(400,300)">
          <!-- Colorful flowers -->
          <circle cx="-60" cy="-40" r="25" fill="#EF4444" />
          <circle cx="60" cy="-40" r="25" fill="#8B5CF6" />
          <circle cx="0" cy="-70" r="25" fill="#F59E0B" />
          <circle cx="-30" cy="10" r="25" fill="#10B981" />
          <circle cx="30" cy="10" r="25" fill="#3B82F6" />
          
          <!-- Centers -->
          <circle cx="-60" cy="-40" r="8" fill="#FFF" />
          <circle cx="60" cy="-40" r="8" fill="#FFF" />
          <circle cx="0" cy="-70" r="8" fill="#FFF" />
          <circle cx="-30" cy="10" r="8" fill="#FFF" />
          <circle cx="30" cy="10" r="8" fill="#FFF" />
          
          <!-- Stems -->
          <rect x="-3" y="35" width="6" height="100" fill="#10B981" />
        </g>
        
        <!-- Confetti -->
        <circle cx="150" cy="150" r="4" fill="#EF4444" />
        <circle cx="650" cy="200" r="4" fill="#8B5CF6" />
        <circle cx="200" cy="400" r="4" fill="#F59E0B" />
        <circle cx="600" cy="450" r="4" fill="#10B981" />
        
        <text x="400" y="570" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  } else if (filename.includes('blog-care')) {
    return `
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F0FDF4" />
        
        <!-- Flower care illustration -->
        <g transform="translate(200,200)">
          <!-- Flower being cut -->
          <circle cx="0" cy="-80" r="30" fill="${colorSet.primary}" />
          <rect x="-2" y="-50" width="4" height="80" fill="#10B981" />
          
          <!-- Scissors -->
          <g transform="translate(0,30) rotate(45)">
            <rect x="-20" y="-2" width="40" height="4" fill="#374151" />
            <rect x="-15" y="-8" width="8" height="4" fill="#374151" />
            <rect x="7" y="-8" width="8" height="4" fill="#374151" />
          </g>
        </g>
        
        <!-- Water droplets -->
        <g transform="translate(500,150)">
          <ellipse cx="0" cy="0" rx="8" ry="12" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="20" cy="30" rx="6" ry="9" fill="#3B82F6" opacity="0.7" />
          <ellipse cx="-15" cy="25" rx="7" ry="10" fill="#3B82F6" opacity="0.7" />
        </g>
        
        <text x="400" y="380" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  } else if (filename.includes('loyalty-happy-customers')) {
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="loyaltyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorSet.primary};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:${colorSet.secondary};stop-opacity:0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#loyaltyGrad)" />
        
        <!-- Happy customers with flowers -->
        <g transform="translate(400,300)">
          <!-- Customer 1 -->
          <g transform="translate(-150,0)">
            <circle cx="0" cy="-60" r="25" fill="#FCD34D" />
            <rect x="-15" y="-35" width="30" height="40" fill="${colorSet.primary}" opacity="0.8" />
            <!-- Bouquet -->
            <circle cx="20" cy="-20" r="12" fill="${colorSet.secondary}" />
            <circle cx="25" cy="-25" r="8" fill="${colorSet.accent}" />
            <rect x="22" y="-8" width="3" height="20" fill="#10B981" />
          </g>
          
          <!-- Customer 2 -->
          <g transform="translate(0,0)">
            <circle cx="0" cy="-60" r="25" fill="#F87171" />
            <rect x="-15" y="-35" width="30" height="40" fill="${colorSet.secondary}" opacity="0.8" />
            <!-- Star rating -->
            <text x="0" y="20" font-family="Arial" font-size="20" text-anchor="middle" fill="${colorSet.accent}">⭐⭐⭐⭐⭐</text>
          </g>
          
          <!-- Customer 3 -->
          <g transform="translate(150,0)">
            <circle cx="0" cy="-60" r="25" fill="#A78BFA" />
            <rect x="-15" y="-35" width="30" height="40" fill="${colorSet.accent}" opacity="0.8" />
            <!-- Loyalty card -->
            <rect x="-10" y="-10" width="20" height="15" fill="#FFF" stroke="${colorSet.primary}" stroke-width="2" />
            <text x="0" y="0" font-family="Arial" font-size="8" text-anchor="middle" fill="${colorSet.primary}">VIP</text>
          </g>
          
          <!-- Hearts and decorations -->
          <text x="-75" y="-120" font-family="Arial" font-size="24" fill="${colorSet.secondary}">💖</text>
          <text x="75" y="-120" font-family="Arial" font-size="24" fill="${colorSet.primary}">💖</text>
          <text x="0" y="-140" font-family="Arial" font-size="24" fill="${colorSet.accent}">🌟</text>
        </g>
        
        <text x="400" y="570" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  } else {
    // Default flower SVG
    return `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F9FAFB" />
        
        <g transform="translate(400,300)">
          <circle cx="0" cy="0" r="40" fill="${colorSet.primary}" opacity="0.8" />
          <circle cx="0" cy="0" r="20" fill="#FFF" opacity="0.9" />
        </g>
        
        <text x="400" y="550" font-family="Arial" font-size="14" text-anchor="middle" fill="#374151">${altText}</text>
      </svg>
    `;
  }
}
