import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { contactInfo, insertContactInfoSchema, type ContactInfo } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, requireRole } from "./auth";

const router = Router();

// GET /api/contact-info - Get contact information
router.get("/", async (req, res) => {
  try {
    const [contact] = await db
      .select()
      .from(contactInfo)
      .limit(1);

    // If no contact info exists, return default values
    const defaultContact: ContactInfo = {
      id: 0,
      phone: "8 (800) 123-45-67",
      email: "info@tsvetokraft.ru",
      address: "г. Москва, ул. Цветочная, д. 15",
      workingHours: "Пн-Вс: 8:00 - 22:00",
      socialMedia: JSON.stringify({
        telegram: "@tsvetokraft",
        instagram: "@tsvetokraft_moscow",
        vk: "vk.com/tsvetokraft"
      }),
      additionalInfo: JSON.stringify({
        whatsapp: "+7 (999) 123-45-67",
        mapUrl: "https://yandex.ru/maps/?text=55.751244,37.618423"
      }),
      updatedAt: new Date(),
      updatedBy: null
    };

    res.json(contact || defaultContact);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ error: "Failed to fetch contact information" });
  }
});

// PUT /api/contact-info - Update contact information (admin only)
router.put("/", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const validation = insertContactInfoSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid contact data", 
        details: validation.error.issues 
      });
    }

    const contactData = validation.data;
    const userId = (req as any).user?.id;

    // Check if contact info exists
    const [existingContact] = await db
      .select()
      .from(contactInfo)
      .limit(1);

    let updatedContact: ContactInfo;

    if (existingContact) {
      // Update existing contact info
      [updatedContact] = await db
        .update(contactInfo)
        .set({ 
          ...contactData,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(contactInfo.id, existingContact.id))
        .returning();
    } else {
      // Create new contact info
      [updatedContact] = await db
        .insert(contactInfo)
        .values({
          ...contactData,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .returning();
    }

    res.json({
      message: "Contact information updated successfully",
      contact: updatedContact
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact information" });
  }
});

export default router;