import { Request, Response } from 'express';
import { storage } from './storage';
import type { AuthRequest } from './auth';

// Webhook configuration
export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
}

// N8N integration helpers
export class N8NIntegration {
  private webhooks: Map<string, WebhookConfig> = new Map();
  
  // Register webhook
  async registerWebhook(name: string, config: WebhookConfig): Promise<void> {
    this.webhooks.set(name, config);
  }
  
  // Trigger webhook
  async triggerWebhook(eventType: string, data: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const payload = {
      event: eventType,
      data,
      timestamp,
      source: 'tsvetokraft-website'
    };
    
    for (const [name, webhook] of this.webhooks) {
      if (webhook.isActive && webhook.events.includes(eventType)) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Tsvetokraft-Webhook/1.0'
          };
          
          // Add signature if secret provided
          if (webhook.secret) {
            const crypto = await import('crypto');
            const signature = crypto
              .createHmac('sha256', webhook.secret)
              .update(JSON.stringify(payload))
              .digest('hex');
            headers['X-Webhook-Signature'] = `sha256=${signature}`;
          }
          
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            console.error(`Webhook ${name} failed:`, response.status, response.statusText);
          } else {
            console.log(`Webhook ${name} triggered successfully for event: ${eventType}`);
          }
        } catch (error) {
          console.error(`Webhook ${name} error:`, error);
        }
      }
    }
  }
  
  // Webhook endpoints for external services
  async handleCallbackRequest(data: any): Promise<void> {
    await this.triggerWebhook('callback.created', {
      id: data.id,
      name: data.name,
      phone: data.phone,
      message: data.message,
      callTime: data.callTime,
      createdAt: data.createdAt
    });
  }
  
  async handleOrderCreated(data: any): Promise<void> {
    await this.triggerWebhook('order.created', {
      orderId: data.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: data.items,
      totalAmount: data.totalAmount,
      createdAt: data.createdAt
    });
  }
  
  async handleBlogPostPublished(data: any): Promise<void> {
    await this.triggerWebhook('blog.published', {
      postId: data.id,
      title: data.title,
      category: data.category,
      publishedAt: data.createdAt
    });
  }
}

export const n8nIntegration = new N8NIntegration();

// Webhook management endpoints
export async function registerWebhookEndpoint(req: AuthRequest, res: Response) {
  try {
    const { name, url, events, secret } = req.body;
    
    if (!name || !url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing required fields: name, url, events' });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }
    
    // Validate events
    const allowedEvents = [
      'callback.created',
      'order.created', 
      'order.updated',
      'blog.published',
      'portfolio.created',
      'user.registered'
    ];
    
    const invalidEvents = events.filter((event: string) => !allowedEvents.includes(event));
    if (invalidEvents.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid event types', 
        invalid: invalidEvents,
        allowed: allowedEvents 
      });
    }
    
    await n8nIntegration.registerWebhook(name, {
      url,
      events,
      secret,
      isActive: true
    });
    
    res.json({ message: 'Webhook registered successfully', name });
  } catch (error) {
    console.error('Webhook registration error:', error);
    res.status(500).json({ error: 'Failed to register webhook' });
  }
}

// Test webhook endpoint
export async function testWebhookEndpoint(req: AuthRequest, res: Response) {
  try {
    const { name } = req.params;
    
    await n8nIntegration.triggerWebhook('test.event', {
      message: 'This is a test webhook from Tsvetokraft',
      timestamp: new Date().toISOString(),
      testData: {
        webhookName: name,
        triggeredBy: req.user?.username
      }
    });
    
    res.json({ message: 'Test webhook sent successfully' });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(500).json({ error: 'Failed to send test webhook' });
  }
}

// External API endpoint for N8N to call
export async function n8nApiEndpoint(req: Request, res: Response) {
  try {
    const { action, data } = req.body;
    
    switch (action) {
      case 'get_callback_requests':
        const callbacks = await storage.getAllCallbackRequests();
        res.json({ success: true, data: callbacks });
        break;
        
      case 'get_blog_posts':
        const posts = await storage.getAllBlogPosts();
        res.json({ success: true, data: posts });
        break;
        
      case 'get_portfolio_items':
        const portfolio = await storage.getAllPortfolioItems();
        res.json({ success: true, data: portfolio });
        break;
        
      case 'create_callback_request':
        if (!data.name || !data.phone) {
          return res.status(400).json({ error: 'Name and phone are required' });
        }
        const callback = await storage.createCallbackRequest(data);
        await n8nIntegration.handleCallbackRequest(callback);
        res.json({ success: true, data: callback });
        break;
        
      case 'update_callback_status':
        if (!data.id || !data.status) {
          return res.status(400).json({ error: 'ID and status are required' });
        }
        const updated = await storage.updateCallbackRequest(data.id, { status: data.status });
        res.json({ success: true, data: updated });
        break;
        
      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('N8N API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Initialize default webhooks for development
export async function initializeDefaultWebhooks() {
  // Example webhook configurations - replace with actual N8N webhook URLs
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (webhookUrl) {
    await n8nIntegration.registerWebhook('default_n8n', {
      url: webhookUrl,
      events: ['callback.created', 'order.created', 'blog.published'],
      secret: process.env.N8N_WEBHOOK_SECRET,
      isActive: true
    });
    
    console.log('Default N8N webhook registered successfully');
  }
}