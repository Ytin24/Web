import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertSectionSchema, insertBlogPostSchema, insertPortfolioItemSchema, 
  insertCallbackRequestSchema, insertLoyaltyProgramSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Sections routes
  app.get("/api/sections", async (req, res) => {
    try {
      const sections = await storage.getAllSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

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
      
      const updatedRequest = await storage.updateCallbackRequestStatus(id, status);
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

  const httpServer = createServer(app);
  return httpServer;
}
