import crypto from 'crypto';
import { storage } from './storage';
import type { Webhook, InsertWebhookDelivery } from '@shared/schema';

export interface WebhookEventData {
  eventType: string;
  data: any;
  timestamp: string;
  source: string;
}

// Доступные события webhook'ов
export const WEBHOOK_EVENTS = {
  // События заявок на звонок
  'callback.created': 'Новая заявка на обратный звонок',
  'callback.updated': 'Статус заявки изменен',
  
  // События чата с клиентами
  'chat.message_sent': 'Новое сообщение в чате',
  'chat.conversation_started': 'Начат новый диалог',
  
  // События блога
  'blog.post_created': 'Создана новая статья',
  'blog.post_published': 'Статья опубликована',
  
  // События портфолио
  'portfolio.item_created': 'Добавлена новая работа в портфолио',
  'portfolio.item_updated': 'Работа в портфолио обновлена',
  
  // События продаж
  'sale.created': 'Новая продажа',
  'sale.updated': 'Продажа обновлена',
  
  // События товаров
  'product.created': 'Новый товар добавлен',
  'product.updated': 'Товар обновлен',
  'product.low_stock': 'Товар заканчивается',
  
  // События клиентов
  'customer.created': 'Новый клиент',
  'customer.updated': 'Данные клиента обновлены',
  
  // Системные события
  'system.backup_completed': 'Резервное копирование завершено',
  'system.error': 'Системная ошибка',
} as const;

export type WebhookEventType = keyof typeof WEBHOOK_EVENTS;

export class WebhookService {
  
  // Отправка webhook'а всем подписанным адресам
  async triggerWebhook(eventType: WebhookEventType, data: any, userId?: number): Promise<void> {
    const webhooks = userId 
      ? await storage.getWebhooksByUserId(userId)
      : await storage.getAllWebhooks();
    
    const activeWebhooks = webhooks.filter(w => w.isActive);
    
    if (activeWebhooks.length === 0) {
      console.log(`Активные webhook'и не найдены для события: ${eventType}`);
      return;
    }

    const eventData: WebhookEventData = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      source: 'tsvetokraft-website'
    };

    // Отправка webhook'ов параллельно
    const deliveryPromises = activeWebhooks.map(webhook => 
      this.deliverWebhook(webhook, eventData)
    );

    await Promise.allSettled(deliveryPromises);
  }

  // Доставка webhook'а на конкретный адрес
  private async deliverWebhook(webhook: Webhook, eventData: WebhookEventData): Promise<void> {
    const subscribedEvents = JSON.parse(webhook.events) as string[];
    
    // Проверка подписки на данное событие
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

    // Добавление подписи если указан секретный ключ
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
        signal: AbortSignal.timeout(30000) // Таймаут 30 секунд
      });

      responseStatus = response.status;
      responseBody = await response.text().catch(() => null);
      successful = response.ok;

      if (successful) {
        console.log(`Webhook ${webhook.name} (${webhook.id}) успешно доставлен для события: ${eventData.eventType}`);
      } else {
        console.error(`Webhook ${webhook.name} (${webhook.id}) ошибка со статусом ${responseStatus}: ${responseBody}`);
      }

    } catch (error: any) {
      console.error(`Ошибка доставки webhook'а ${webhook.name} (${webhook.id}):`, error.message);
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

  // Проверка URL webhook'а
  async validateWebhookUrl(url: string, secret?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const testPayload = {
        eventType: 'webhook.test',
        data: { message: 'Тестовый webhook от Цветокрафт' },
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
        signal: AbortSignal.timeout(10000) // Таймаут 10 секунд для проверки
      });

      return { valid: response.ok };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  // Получение статистики webhook'а
  async getWebhookStats(webhookId: number): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDelivery?: Date;
    successRate: number;
  }> {
    const webhook = await storage.getWebhook(webhookId);
    if (!webhook) {
      throw new Error('Webhook не найден');
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