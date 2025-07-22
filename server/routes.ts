import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertSectionSchema, insertBlogPostSchema, insertPortfolioItemSchema, 
  insertCallbackRequestSchema, insertLoyaltyProgramSchema, insertImageSchema, insertCustomerSchema,
  insertSaleSchema, insertSettingSchema, insertProductSchema, insertSaleItemSchema,
  createMultiProductSaleSchema
} from "@shared/schema";
import { 
  authenticateToken, 
  requireRole, 
  validateInput, 
  rateLimit, 
  securityHeaders,
  type AuthRequest 
} from "./auth";

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
  

  
  // Setup token management routes (protected by JWT auth)
  app.use('/api', createTokenRoutes(storage));
  
  // Setup API documentation
  setupSwagger(app);
  
  // Initialize webhooks
  await initializeDefaultWebhooks();
  
  // Import blog assistant for admin routes
  const { getBlogAssistantResponse } = await import('./openai-service');

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

  app.patch("/api/sections/:id", async (req, res) => {
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

  // Quick post generation endpoint
  app.post("/api/blog-posts/quick-generate", async (req, res) => {
    try {
      const { generateQuickPost } = await import('./openai-service');
      const postData = await generateQuickPost();
      
      // Create the blog post with the generated data
      const validatedData = insertBlogPostSchema.parse({
        ...postData,
        isPublished: false // Keep as draft initially
      });
      
      const blogPost = await storage.createBlogPost(validatedData);
      res.status(201).json(blogPost);
    } catch (error) {
      console.error("Quick post generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate quick post",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

  app.patch("/api/portfolio-items/:id", async (req, res) => {
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

  app.patch("/api/loyalty-program/:id", async (req, res) => {
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

  app.post("/api/loyalty-program", async (req, res) => {
    try {
      const validatedData = insertLoyaltyProgramSchema.parse(req.body);
      const loyaltyLevel = await storage.createLoyaltyLevel(validatedData);
      res.status(201).json(loyaltyLevel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loyalty program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loyalty program" });
    }
  });

  app.delete("/api/loyalty-program/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLoyaltyLevel(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete loyalty program" });
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
      let image = await storage.getImageByFilename(filename);
      
      // If image doesn't exist in database, create a fallback with default flower image
      if (!image) {
        // Determine category from filename
        let category = 'general';
        if (filename.includes('hero')) category = 'hero';
        else if (filename.includes('blog')) category = 'blog';
        else if (filename.includes('portfolio')) category = 'portfolio';
        else if (filename.includes('loyalty')) category = 'loyalty';
        else if (filename.includes('about')) category = 'about';
        
        // Generate appropriate alt text
        let altText = 'Flower arrangement';
        if (filename.includes('care')) altText = 'Flower care guide';
        else if (filename.includes('water')) altText = 'Proper watering technique';
        else if (filename.includes('seasonal')) altText = 'Seasonal flower composition';
        else if (filename.includes('wedding')) altText = 'Wedding bouquet';
        else if (filename.includes('corporate')) altText = 'Corporate flower arrangement';
        else if (filename.includes('birthday')) altText = 'Birthday flower arrangement';
        
        // Use a default fallback flower image instead of SVG
        const fallbackUrl = getFallbackImageUrl(category);
        return res.redirect(302, fallbackUrl);
      }

      // If image exists in database, redirect to actual image URL
      if (image.url.startsWith('http')) {
        return res.redirect(302, image.url);
      }
      
      // For local files or other cases, fallback to default image
      const fallbackUrl = getFallbackImageUrl(image.category);
      res.redirect(302, fallbackUrl);
    } catch (error) {
      console.error('Error serving image:', error);
      // Return fallback flower image on error
      const fallbackUrl = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
      res.redirect(302, fallbackUrl);
    }
  });

  // Import and setup chatbot routes
  const { default: chatbotRoutes } = await import('./chatbot-routes.js');
  app.use('/api/chatbot', chatbotRoutes);



  // Customer management routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const updatedCustomer = await storage.updateCustomer(id, validatedData);
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Sales CRM routes
  app.get("/api/sales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let salesData;
      
      if (startDate && endDate) {
        salesData = await storage.getSalesByDateRange(new Date(startDate as string), new Date(endDate as string));
      } else {
        salesData = await storage.getAllSales();
      }
      
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/stats", async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales statistics" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSaleSchema.partial().parse(req.body);
      const updatedSale = await storage.updateSale(id, validatedData);
      res.json(updatedSale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSale(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Multi-product sales routes
  app.get("/api/sales-with-items", async (req, res) => {
    try {
      const salesWithItems = await storage.getAllSalesWithItems();
      res.json(salesWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales with items" });
    }
  });

  app.get("/api/sales-with-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const saleWithItems = await storage.getSaleWithItems(id);
      if (!saleWithItems) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(saleWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale with items" });
    }
  });

  app.post("/api/multi-product-sales", async (req, res) => {
    try {
      const validatedData = createMultiProductSaleSchema.parse(req.body);
      const saleWithItems = await storage.createMultiProductSale(validatedData);
      res.status(201).json(saleWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid multi-product sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create multi-product sale" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, active } = req.query;
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (active === 'true') {
        products = await storage.getActiveProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, validatedData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(validatedData.key, validatedData.value, validatedData.description);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const { value, description } = req.body;
      const setting = await storage.setSetting(key, value, description);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.delete("/api/settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSetting(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // Test route to debug auth issues
  app.post("/api/test-auth", (req, res) => {
    console.log('Test auth route called');
    res.json({ message: "Test auth route works" });
  });

  // Blog AI Assistant route
  app.post("/api/blog-assistant", async (req, res) => {
    try {
      const { prompt } = req.body;
      console.log('Blog AI Assistant called with prompt:', prompt?.slice(0, 50));
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Prompt is required" });
      }

      if (!process.env.DEEPSEEK_API_KEY) {
        console.log('DeepSeek API key not found');
        return res.status(500).json({ 
          message: "AI сервис не настроен. Обратитесь к администратору."
        });
      }

      console.log('DeepSeek API key found, generating content...');
      const openaiService = await import('./openai-service');
      const response = await openaiService.generateBlogContent(prompt);
      
      console.log('Content generated successfully');
      res.json({ response });
    } catch (error) {
      console.error('Blog AI Assistant error:', error);
      res.status(500).json({ 
        message: "Профессор Ботаникус временно недоступен. Попробуйте позже.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Fallback image URL function
function getFallbackImageUrl(category: string): string {
  const fallbackImages = {
    hero: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', // Beautiful flower arrangement
    about: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', // Florist at work
    portfolio: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', // Wedding bouquet
    blog: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Flower care
    loyalty: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', // Happy customers
    general: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600' // Default flower arrangement
  };

  return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.general;
}
