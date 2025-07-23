import crypto from 'crypto';
import { storage } from './storage';
import type { Webhook, InsertWebhookDelivery } from '@shared/schema';

export interface WebhookEventData {
  eventType: string;
  data: any;
  timestamp: string;
  source: string;
}

// Available webhook events
export const WEBHOOK_EVENTS = {
  // Callback requests
  'callback.created': 'Новая заявка на обратный звонок',
  'callback.updated': 'Статус заявки изменен',
  
  // Chat events
  'chat.message_sent': 'Новое сообщение в чате',
  'chat.conversation_started': 'Начат новый диалог',
  
  // Blog events
  'blog.post_created': 'Создана новая статья',
  'blog.post_published': 'Статья опубликована',
  
  // Portfolio events
  'portfolio.item_created': 'Добавлена новая работа в портфолио',
  'portfolio.item_updated': 'Работа в портфолио обновлена',
  
  // Sales events
  'sale.created': 'Новая продажа',
  'sale.updated': 'Продажа обновлена',
  
  // Product events
  'product.created': 'Новый товар добавлен',
  'product.updated': 'Товар обновлен',
  'product.low_stock': 'Товар заканчивается',
  
  // Customer events
  'customer.created': 'Новый клиент',
  'customer.updated': 'Данные клиента обновлены',
  
  // System events
  'system.backup_completed': 'Резервное копирование завершено',
  'system.error': 'Системная ошибка',
} as const;

export type WebhookEventType = keyof typeof WEBHOOK_EVENTS;

export class WebhookService {
  
  // Send webhook to all subscribed endpoints
  async triggerWebhook(eventType: WebhookEventType, data: any, userId?: number): Promise<void> {
    const webhooks = userId 
      ? await storage.getWebhooksByUserId(userId)
      : await storage.getAllWebhooks();
    
    const activeWebhooks = webhooks.filter(w => w.isActive);
    
    if (activeWebhooks.length === 0) {
      console.log(`No active webhooks found for event: ${eventType}`);
      return;
    }

    const eventData: WebhookEventData = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      source: 'tsvetokraft-website'
    };

    // Send webhooks in parallel
    const deliveryPromises = activeWebhooks.map(webhook => 
      this.deliverWebhook(webhook, eventData)
    );

    await Promise.allSettled(deliveryPromises);
  }

  // Deliver webhook to specific endpoint
  private async deliverWebhook(webhook: Webhook, eventData: WebhookEventData): Promise<void> {
    const subscribedEvents = JSON.parse(webhook.events) as string[];
    
    // Check if webhook is subscribed to this event
    if (!subscribedEvents.includes(eventData.eventType) && !subscribedEvents.includes('*')) {
      return;
    }

    const payload = JSON.stringify(eventData);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Tsvetokraft-Webhook/1.0',
      'X-Webhook-Event': eventData.eventType,
      'X-Webhook-Timestamp': eventData.timestamp,
    };

    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payload)
        .digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    let successful = false;
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let attemptCount = 1;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payload,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      responseStatus = response.status;
      responseBody = await response.text().catch(() => null);
      successful = response.ok;

      if (successful) {
        console.log(`Webhook ${webhook.name} (${webhook.id}) delivered successfully for event: ${eventData.eventType}`);
      } else {
        console.error(`Webhook ${webhook.name} (${webhook.id}) failed with status ${responseStatus}: ${responseBody}`);
      }

    } catch (error: any) {
      console.error(`Webhook ${webhook.name} (${webhook.id}) delivery failed:`, error.message);
      responseBody = error.message;
    }

    // Log delivery attempt
    const deliveryLog: InsertWebhookDelivery = {
      webhookId: webhook.id,
      eventType: eventData.eventType,
      payload,
      responseStatus,
      responseBody,
      attemptCount,
      successful,
      deliveredAt: successful ? new Date() : null,
    };

    await storage.createWebhookDelivery(deliveryLog);
    await storage.updateWebhookStats(webhook.id, successful);
  }

  // Validate webhook URL
  async validateWebhookUrl(url: string, secret?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const testPayload = {
        eventType: 'webhook.test',
        data: { message: 'Test webhook from Tsvetokraft' },
        timestamp: new Date().toISOString(),
        source: 'tsvetokraft-website'
      };

      const payload = JSON.stringify(testPayload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Tsvetokraft-Webhook/1.0',
        'X-Webhook-Event': 'webhook.test',
      };

      if (secret) {
        const signature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
        signal: AbortSignal.timeout(10000) // 10 second timeout for validation
      });

      return { valid: response.ok };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  // Get webhook statistics
  async getWebhookStats(webhookId: number): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDelivery?: Date;
    successRate: number;
  }> {
    const webhook = await storage.getWebhook(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const deliveries = await storage.getWebhookDeliveries(webhookId, 1000);
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter(d => d.successful).length;
    const failedDeliveries = totalDeliveries - successfulDeliveries;
    const lastDelivery = deliveries[0]?.createdAt || undefined;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      lastDelivery,
      successRate
    };
  }
}

export const webhookService = new WebhookService();