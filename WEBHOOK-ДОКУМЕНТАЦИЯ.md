# 🔗 Система Webhook Уведомлений - Цветокрафт

## Обзор

Система webhook уведомлений позволяет получать уведомления о событиях на сайте Цветокрафт в режиме реального времени. Webhook'и отправляют HTTP POST запросы на указанные URL адреса при возникновении определенных событий.

## Возможности

- ✅ **Множественные webhook'и** - настройка нескольких адресов для разных целей
- ✅ **Фильтрация событий** - подписка только на нужные события
- ✅ **Безопасность** - проверка подлинности через HMAC подписи
- ✅ **Статистика** - отслеживание успешности доставки
- ✅ **Повторные попытки** - автоматическая повторная отправка при ошибках
- ✅ **Логирование** - полная история доставок

## Доступные События

### 📞 События заявок
- `callback.created` - Новая заявка на обратный звонок
- `callback.updated` - Изменение статуса заявки

### 💬 События чата
- `chat.message_sent` - Новое сообщение в чате
- `chat.conversation_started` - Начало нового диалога

### 📝 События блога
- `blog.post_created` - Создание новой статьи
- `blog.post_published` - Публикация статьи

### 🎨 События портфолио
- `portfolio.item_created` - Добавление новой работы
- `portfolio.item_updated` - Обновление работы

### 💰 События продаж
- `sale.created` - Новая продажа
- `sale.updated` - Обновление продажи

### 📦 События товаров
- `product.created` - Добавление нового товара
- `product.updated` - Обновление товара
- `product.low_stock` - Низкий остаток товара

### 👥 События клиентов
- `customer.created` - Регистрация нового клиента
- `customer.updated` - Обновление данных клиента

### ⚙️ Системные события
- `system.backup_completed` - Завершение резервного копирования
- `system.error` - Системная ошибка

## Настройка Webhook'а

### 1. Через админ панель

1. Войдите в админ панель сайта
2. Перейдите на вкладку "Webhook'и"
3. Нажмите "Добавить Webhook"
4. Заполните форму:
   - **Название**: Описательное название webhook'а
   - **URL**: Адрес для получения уведомлений
   - **События**: Выберите события для отслеживания
   - **Секретный ключ**: Опциональный ключ для проверки подписи

### 2. Через API

```bash
curl -X POST https://your-site.com/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "name": "Мой Webhook",
    "url": "https://my-server.com/webhook",
    "events": ["callback.created", "sale.created"],
    "secret": "my-secret-key"
  }'
```

## Формат Payload

Все webhook'и отправляются в формате JSON:

```json
{
  "eventType": "callback.created",
  "data": {
    "id": 123,
    "name": "Иван Петров",
    "phone": "+7 (900) 123-45-67",
    "message": "Хочу заказать букет на день рождения",
    "callTime": "завтра утром",
    "createdAt": "2025-01-23T15:30:00Z"
  },
  "timestamp": "2025-01-23T15:30:05Z",
  "source": "tsvetokraft-website"
}
```

## HTTP Заголовки

Каждый webhook содержит следующие заголовки:

```
Content-Type: application/json
User-Agent: Tsvetokraft-Webhook/1.0
X-Webhook-Event: callback.created
X-Webhook-Timestamp: 2025-01-23T15:30:05Z
X-Webhook-Signature: sha256=abc123... (если установлен секретный ключ)
```

## Проверка Подписи

Если установлен секретный ключ, используйте его для проверки подлинности:

### Node.js
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

// Использование
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (verifyWebhookSignature(payload, signature, 'your-secret')) {
    // Webhook подлинный
    console.log('Получено событие:', req.body.eventType);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});
```

### PHP
```php
<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($expectedSignature, $signature);
}

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'];

if (verifyWebhookSignature($payload, $signature, 'your-secret')) {
    $data = json_decode($payload, true);
    echo "Получено событие: " . $data['eventType'];
    http_response_code(200);
} else {
    http_response_code(401);
}
?>
```

### Python
```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

# Flask пример
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data(as_text=True)
    
    if verify_webhook_signature(payload, signature, 'your-secret'):
        data = request.get_json()
        print(f"Получено событие: {data['eventType']}")
        return 'OK', 200
    else:
        return 'Unauthorized', 401
```

## Примеры Обработчиков

### Уведомления в Telegram

```javascript
const axios = require('axios');

app.post('/webhook', (req, res) => {
  const { eventType, data } = req.body;
  
  if (eventType === 'callback.created') {
    const message = `🔔 Новая заявка!\n\n` +
                   `👤 ${data.name}\n` +
                   `📞 ${data.phone}\n` +
                   `💬 ${data.message}\n` +
                   `⏰ ${data.callTime}`;
    
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });
  }
  
  res.status(200).send('OK');
});
```

### Отправка Email

```python
import smtplib
from email.mime.text import MIMEText

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.get_json()
    
    if data['eventType'] == 'sale.created':
        sale_data = data['data']
        
        msg = MIMEText(f"""
        Новая продажа на сайте!
        
        Клиент: {sale_data['customerName']}
        Телефон: {sale_data['customerPhone']}
        Товар: {sale_data['productName']}
        Сумма: {sale_data['totalAmount']} руб.
        """)
        
        msg['Subject'] = 'Новая продажа - Цветокрафт'
        msg['From'] = 'noreply@tsvetokraft.ru'
        msg['To'] = 'admin@tsvetokraft.ru'
        
        server = smtplib.SMTP('localhost')
        server.send_message(msg)
        server.quit()
    
    return 'OK', 200
```

### Интеграция с CRM

```javascript
app.post('/webhook', async (req, res) => {
  const { eventType, data } = req.body;
  
  if (eventType === 'customer.created') {
    // Добавление клиента в CRM систему
    await axios.post('https://your-crm.com/api/contacts', {
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: 'Цветокрафт Сайт',
      tags: ['website', 'new-customer']
    }, {
      headers: {
        'Authorization': `Bearer ${CRM_API_KEY}`
      }
    });
  }
  
  res.status(200).send('OK');
});
```

## Интеграция с n8n

1. Создайте новый workflow в n8n
2. Добавьте узел "Webhook"
3. Скопируйте URL webhook'а
4. Настройте webhook в админ панели Цветокрафт
5. Добавьте узлы для обработки событий:
   - **Slack/Discord** - уведомления в мессенджеры
   - **Google Sheets** - запись данных в таблицы  
   - **Trello/Notion** - создание задач
   - **Twilio** - отправка SMS

## Тестирование

### Локальный сервер для тестирования

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('Получен webhook:', req.body);
  console.log('Заголовки:', req.headers);
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook сервер запущен на порту 3000');
});
```

### Использование webhook.site

1. Перейдите на https://webhook.site
2. Скопируйте уникальный URL
3. Используйте его в настройках webhook'а
4. Просматривайте входящие запросы в браузере

### Тестирование через ngrok

```bash
# Запустите локальный сервер
node webhook-server.js

# В другом терминале
npx ngrok http 3000

# Используйте полученный URL в настройках webhook'а
```

## API Управления

### Получение списка webhook'ов

```bash
GET /api/webhooks
Authorization: Bearer YOUR_TOKEN
```

### Создание webhook'а

```bash
POST /api/webhooks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Мой Webhook",
  "url": "https://my-server.com/webhook",
  "events": ["callback.created", "sale.created"],
  "secret": "optional-secret"
}
```

### Обновление webhook'а

```bash
PUT /api/webhooks/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Обновленное название",
  "isActive": false
}
```

### Удаление webhook'а

```bash
DELETE /api/webhooks/:id
Authorization: Bearer YOUR_TOKEN
```

### Тестирование webhook'а

```bash
POST /api/webhooks/:id/test
Authorization: Bearer YOUR_TOKEN
```

### Статистика webhook'а

```bash
GET /api/webhooks/:id/stats
Authorization: Bearer YOUR_TOKEN
```

Ответ:
```json
{
  "totalDeliveries": 150,
  "successfulDeliveries": 145,
  "failedDeliveries": 5,
  "successRate": 96.7,
  "lastDelivery": "2025-01-23T15:30:00Z"
}
```

## Устранение Неисправностей

### Частые проблемы

1. **Webhook не получается** 
   - Проверьте доступность URL
   - Убедитесь что сервер отвечает на POST запросы
   - Проверьте логи на наличие ошибок

2. **Ошибка подписи**
   - Убедитесь что используете правильный секретный ключ
   - Проверьте алгоритм вычисления подписи
   - Сравните raw payload с тем что используете для подписи

3. **Таймауты**
   - Webhook'и имеют таймаут 30 секунд
   - Оптимизируйте обработку на вашем сервере
   - Используйте асинхронную обработку для долгих операций

### Отладка

Включите логирование в админ панели для просмотра:
- Статуса доставки
- Кодов ответа
- Времени доставки
- Количества попыток

## Безопасность

### Рекомендации

1. **Всегда используйте HTTPS** для webhook URL'ов
2. **Проверяйте подписи** при использовании секретных ключей
3. **Ограничивайте доступ** к webhook endpoints
4. **Логируйте подозрительную активность**
5. **Используйте сильные секретные ключи** (минимум 32 символа)

### Проверка источника

```javascript
// Проверка IP адреса (опционально)
const allowedIPs = ['YOUR_SERVER_IP'];

app.post('/webhook', (req, res) => {
  const clientIP = req.ip;
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).send('Forbidden');
  }
  
  // Обработка webhook'а
});
```

## Лимиты и Ограничения

- **Максимум webhook'ов на пользователя**: 10
- **Максимальный размер payload**: 1MB
- **Таймаут доставки**: 30 секунд
- **Количество повторных попыток**: 3
- **Интервал между попытками**: 5, 25, 125 секунд

## Поддержка

При возникновении проблем:
1. Проверьте логи в админ панели
2. Убедитесь что webhook URL доступен
3. Проверьте формат payload
4. Обратитесь в техподдержку с деталями ошибки

---

**Создано для системы Цветокрафт** | Версия 1.0 | Январь 2025