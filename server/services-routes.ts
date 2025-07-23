import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { services, insertServiceSchema, type Service } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, requireRole } from "./auth";

const router = Router();

// GET /api/services - Get all services
router.get("/", async (req, res) => {
  try {
    const allServices = await db
      .select()
      .from(services)
      .orderBy(desc(services.sortOrder), services.name);

    res.json(allServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET /api/services/active - Get only active services
router.get("/active", async (req, res) => {
  try {
    const activeServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(desc(services.sortOrder), services.name);

    res.json(activeServices);
  } catch (error) {
    console.error("Error fetching active services:", error);
    res.status(500).json({ error: "Failed to fetch active services" });
  }
});

// GET /api/services/:id - Get specific service
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// POST /api/services - Create new service (admin only)
router.post("/", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const validation = insertServiceSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid service data", 
        details: validation.error.issues 
      });
    }

    const serviceData = validation.data;
    const userId = (req as any).user?.id;

    const [newService] = await db
      .insert(services)
      .values({
        ...serviceData,
        updatedAt: new Date(),
        updatedBy: userId
      })
      .returning();

    res.status(201).json({
      message: "Service created successfully",
      service: newService
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT /api/services/:id - Update service (admin only)
router.put("/:id", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const validation = insertServiceSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid service data", 
        details: validation.error.issues 
      });
    }

    const serviceData = validation.data;
    const userId = (req as any).user?.id;

    const [updatedService] = await db
      .update(services)
      .set({
        ...serviceData,
        updatedAt: new Date(),
        updatedBy: userId
      })
      .where(eq(services.id, id))
      .returning();

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service updated successfully",
      service: updatedService
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE /api/services/:id - Delete service (admin only)
router.delete("/:id", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service deleted successfully",
      service: deletedService
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;