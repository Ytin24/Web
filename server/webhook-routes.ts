import { Router } from 'express';
import { authenticateToken } from './auth';
import { storage } from './storage';
import { webhookService, WEBHOOK_EVENTS } from './webhook-service';
import { insertWebhookSchema, updateWebhookSchema } from '@shared/schema';
import { z } from 'zod';
import type { AuthRequest } from './auth';

const router = Router();

// Получить все доступные события webhook'ов
router.get('/events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const events = Object.entries(WEBHOOK_EVENTS).map(([key, description]) => ({
      event: key,
      description
    }));
    
    res.json(events);
  } catch (error) {
    console.error('Ошибка получения событий webhook\'ов:', error);
    res.status(500).json({ error: 'Не удалось получить события webhook\'ов' });
  }
});

// Получить все webhook'и текущего пользователя
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhooks = await storage.getWebhooksByUserId(req.user!.id);
    
    // Добавить статистику к каждому webhook'у
    const webhooksWithStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const stats = await webhookService.getWebhookStats(webhook.id);
        return {
          ...webhook,
          events: JSON.parse(webhook.events),
          stats
        };
      })
    );
    
    res.json(webhooksWithStats);
  } catch (error) {
    console.error('Ошибка получения webhook\'ов:', error);
    res.status(500).json({ error: 'Не удалось получить webhook\'и' });
  }
});

// Get specific webhook
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhook = await storage.getWebhook(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Check ownership
    if (webhook.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stats = await webhookService.getWebhookStats(webhook.id);
    const deliveries = await storage.getWebhookDeliveries(webhook.id, 20);
    
    res.json({
      ...webhook,
      events: JSON.parse(webhook.events),
      stats,
      recentDeliveries: deliveries
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ error: 'Failed to fetch webhook' });
  }
});

// Create new webhook
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = insertWebhookSchema.parse(req.body);
    
    // Validate events array
    const events = Array.isArray(validatedData.events) 
      ? validatedData.events 
      : JSON.parse(validatedData.events as string);
    
    // Validate event types
    const validEvents = Object.keys(WEBHOOK_EVENTS);
    const invalidEvents = events.filter((event: string) => !validEvents.includes(event) && event !== '*');
    
    if (invalidEvents.length > 0) {
      return res.status(400).json({ 
        error: `Invalid events: ${invalidEvents.join(', ')}` 
      });
    }
    
    // Validate webhook URL
    const validation = await webhookService.validateWebhookUrl(
      validatedData.url, 
      validatedData.secret || undefined
    );
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: `Webhook URL validation failed: ${validation.error}` 
      });
    }
    
    const webhook = await storage.createWebhook({
      ...validatedData,
      userId: req.user!.id,
      events: JSON.stringify(events)
    });
    
    res.status(201).json({
      ...webhook,
      events: JSON.parse(webhook.events)
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhook = await storage.getWebhook(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Check ownership
    if (webhook.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const validatedData = updateWebhookSchema.parse(req.body);
    
    // Validate events if provided
    if (validatedData.events) {
      const events = Array.isArray(validatedData.events) 
        ? validatedData.events 
        : JSON.parse(validatedData.events as string);
      
      const validEvents = Object.keys(WEBHOOK_EVENTS);
      const invalidEvents = events.filter((event: string) => !validEvents.includes(event) && event !== '*');
      
      if (invalidEvents.length > 0) {
        return res.status(400).json({ 
          error: `Invalid events: ${invalidEvents.join(', ')}` 
        });
      }
      
      validatedData.events = JSON.stringify(events);
    }
    
    // Validate URL if changed
    if (validatedData.url) {
      const validation = await webhookService.validateWebhookUrl(
        validatedData.url, 
        validatedData.secret || webhook.secret || undefined
      );
      
      if (!validation.valid) {
        return res.status(400).json({ 
          error: `Webhook URL validation failed: ${validation.error}` 
        });
      }
    }
    
    const updatedWebhook = await storage.updateWebhook(webhook.id, validatedData);
    
    res.json({
      ...updatedWebhook,
      events: JSON.parse(updatedWebhook.events)
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Delete webhook
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhook = await storage.getWebhook(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Check ownership
    if (webhook.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await storage.deleteWebhook(webhook.id);
    
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Test webhook
router.post('/:id/test', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhook = await storage.getWebhook(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Check ownership
    if (webhook.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Send test webhook
    await webhookService.triggerWebhook('webhook.test' as any, {
      message: 'Test webhook from Tsvetokraft admin panel',
      webhookId: webhook.id,
      webhookName: webhook.name
    });
    
    res.json({ success: true, message: 'Test webhook sent' });
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
});

// Get webhook deliveries
router.get('/:id/deliveries', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const webhook = await storage.getWebhook(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    // Check ownership
    if (webhook.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const deliveries = await storage.getWebhookDeliveries(webhook.id, limit);
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch webhook deliveries' });
  }
});

export default router;