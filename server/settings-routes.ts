import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { authenticateToken, requireRole } from "./auth";

const router = Router();

// Схемы валидации
const createSettingSchema = z.object({
  key: z.string().min(1, "Ключ обязателен").regex(/^[a-z_][a-z0-9_]*$/, "Ключ должен содержать только строчные буквы, цифры и подчеркивания"),
  value: z.string(),
  description: z.string().optional()
});

const updateSettingSchema = z.object({
  value: z.string(),
  description: z.string().optional()
});

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Получить все настройки системы
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Список настроек
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   key:
 *                     type: string
 *                   value:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", async (req, res) => {
  try {
    const settings = await storage.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error("Ошибка получения настроек:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Получить настройку по ключу
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Ключ настройки
 *     responses:
 *       200:
 *         description: Настройка найдена
 *       404:
 *         description: Настройка не найдена
 */
router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await storage.getSetting(key);
    
    if (!setting) {
      return res.status(404).json({ error: "Настройка не найдена" });
    }
    
    res.json(setting);
  } catch (error) {
    console.error("Ошибка получения настройки:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Создать новую настройку
 *     tags: [Settings]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 pattern: "^[a-z_][a-z0-9_]*$"
 *                 description: Ключ настройки (только строчные буквы, цифры и подчеркивания)
 *               value:
 *                 type: string
 *                 description: Значение настройки
 *               description:
 *                 type: string
 *                 description: Описание назначения настройки
 *     responses:
 *       201:
 *         description: Настройка создана
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Настройка с таким ключом уже существует
 */
router.post("/", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const validatedData = createSettingSchema.parse(req.body);
    
    // Проверяем, что настройка с таким ключом не существует
    const existingSetting = await storage.getSetting(validatedData.key);
    if (existingSetting) {
      return res.status(409).json({ error: "Настройка с таким ключом уже существует" });
    }
    
    const setting = await storage.createSetting(validatedData);
    
    console.log(`Создана новая настройка: ${validatedData.key} = ${validatedData.value}`);
    
    res.status(201).json(setting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Ошибка валидации", 
        details: error.errors 
      });
    }
    
    console.error("Ошибка создания настройки:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Обновить настройку
 *     tags: [Settings]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Ключ настройки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Настройка обновлена
 *       404:
 *         description: Настройка не найдена
 *       400:
 *         description: Ошибка валидации
 */
router.put("/:key", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { key } = req.params;
    const validatedData = updateSettingSchema.parse(req.body);
    
    const existingSetting = await storage.getSetting(key);
    if (!existingSetting) {
      return res.status(404).json({ error: "Настройка не найдена" });
    }
    
    const updatedSetting = await storage.updateSetting(key, validatedData.value, validatedData.description);
    
    console.log(`Обновлена настройка: ${key} = ${validatedData.value}`);
    
    res.json(updatedSetting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Ошибка валидации", 
        details: error.errors 
      });
    }
    
    console.error("Ошибка обновления настройки:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/settings/{id}:
 *   delete:
 *     summary: Удалить настройку
 *     tags: [Settings]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID настройки
 *     responses:
 *       200:
 *         description: Настройка удалена
 *       404:
 *         description: Настройка не найдена
 */
router.delete("/:id", authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID настройки" });
    }
    
    const setting = await storage.getSettingById(id);
    if (!setting) {
      return res.status(404).json({ error: "Настройка не найдена" });
    }
    
    await storage.deleteSetting(id);
    
    console.log(`Удалена настройка: ${setting.key}`);
    
    res.json({ message: "Настройка удалена успешно" });
  } catch (error) {
    console.error("Ошибка удаления настройки:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default router;