import { Router } from "express";
import { z } from "zod";
import { db } from "./db";
import { siteSettings, insertSiteSettingsSchema, type SiteSetting } from "@shared/schema";
import { eq } from "drizzle-orm";
import { colorSchemes, type ColorSchemeName } from "@shared/color-palette";

const router = Router();

// Validation schema for color scheme
const colorSchemeSchema = z.object({
  schemeName: z.enum(['floralPink', 'botanicalGreen', 'royalPurple'] as const)
});

// GET /api/color-scheme - Get current color scheme
router.get("/", async (req, res) => {
  try {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'colorScheme'))
      .limit(1);

    const currentScheme: ColorSchemeName = setting?.value as ColorSchemeName || 'floralPink';
    
    res.json({
      currentScheme,
      schemeData: colorSchemes[currentScheme],
      availableSchemes: Object.entries(colorSchemes).map(([key, scheme]) => ({
        key: key as ColorSchemeName,
        name: scheme.name,
        description: scheme.description
      }))
    });
  } catch (error) {
    console.error("Error fetching color scheme:", error);
    res.status(500).json({ error: "Failed to fetch color scheme" });
  }
});

// PUT /api/color-scheme - Update color scheme
router.put("/", async (req, res) => {
  try {
    const validation = colorSchemeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid color scheme", 
        details: validation.error.issues 
      });
    }

    const { schemeName } = validation.data;

    // Check if setting exists
    const [existingSetting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'colorScheme'))
      .limit(1);

    if (existingSetting) {
      // Update existing setting
      await db
        .update(siteSettings)
        .set({ 
          value: schemeName,
          updatedAt: new Date(),
          updatedBy: (req as any).user?.id || null
        })
        .where(eq(siteSettings.key, 'colorScheme'));
    } else {
      // Create new setting
      await db
        .insert(siteSettings)
        .values({
          key: 'colorScheme',
          value: schemeName,
          description: 'Активная цветовая схема сайта',
          updatedBy: (req as any).user?.id || null
        });
    }

    res.json({
      success: true,
      message: `Цветовая схема изменена на "${colorSchemes[schemeName].name}"`,
      currentScheme: schemeName,
      schemeData: colorSchemes[schemeName]
    });
  } catch (error) {
    console.error("Error updating color scheme:", error);
    res.status(500).json({ error: "Failed to update color scheme" });
  }
});

// GET /api/color-scheme/preview/:schemeName - Preview scheme data
router.get("/preview/:schemeName", async (req, res) => {
  try {
    const schemeName = req.params.schemeName as ColorSchemeName;
    
    if (!colorSchemes[schemeName]) {
      return res.status(404).json({ error: "Color scheme not found" });
    }

    res.json({
      schemeName,
      schemeData: colorSchemes[schemeName]
    });
  } catch (error) {
    console.error("Error previewing color scheme:", error);
    res.status(500).json({ error: "Failed to preview color scheme" });
  }
});

export default router;