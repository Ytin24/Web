import express from 'express';
import { flowerChatbot, type ChatMessage } from './openai-service.js';

const router = express.Router();

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     tags: [Chatbot]
 *     summary: Get AI chatbot response for flower recommendations
 *     description: Send a message to the AI chatbot and get intelligent flower recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messages]
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Chatbot response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 sentiment:
 *                   type: object
 *                   properties:
 *                     rating:
 *                       type: number
 *                     confidence:
 *                       type: number
 *       400:
 *         description: Invalid request format
 *       500:
 *         description: Internal server error
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Требуется массив сообщений' 
      });
    }

    // Validate message format
    const isValidMessage = (msg: any): msg is ChatMessage => {
      return msg && 
             typeof msg.role === 'string' && 
             ['user', 'assistant'].includes(msg.role) &&
             typeof msg.content === 'string';
    };

    if (!messages.every(isValidMessage)) {
      return res.status(400).json({ 
        error: 'Неверный формат сообщений' 
      });
    }

    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';

    // Get chatbot response first, then sentiment analysis
    const response = await flowerChatbot.getChatResponse(messages);
    
    // Try to get sentiment analysis, but don't fail if it doesn't work
    let sentiment;
    try {
      sentiment = await flowerChatbot.analyzeSentiment(lastUserMessage);
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      sentiment = { rating: 3, confidence: 0.5 }; // Default neutral sentiment
    }

    res.json({ 
      response,
      sentiment 
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при обработке запроса' 
    });
  }
});

/**
 * @swagger
 * /api/chatbot/stream:
 *   post:
 *     tags: [Chatbot]
 *     summary: Get streaming AI chatbot response
 *     description: Get streaming AI chatbot response for real-time conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messages]
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Streaming response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.post('/stream', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Требуется массив сообщений' 
      });
    }

    // Validate message format
    const isValidMessage = (msg: any): msg is ChatMessage => {
      return msg && 
             typeof msg.role === 'string' && 
             ['user', 'assistant'].includes(msg.role) &&
             typeof msg.content === 'string';
    };

    if (!messages.every(isValidMessage)) {
      return res.status(400).json({ 
        error: 'Неверный формат сообщений' 
      });
    }

    // Устанавливаем headers для Server-Sent Events
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    const stream = await flowerChatbot.getChatStreamResponse(messages);
    const reader = stream.getReader();

    // Читаем стрим и отправляем данные клиенту
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Преобразуем Uint8Array в строку
        const chunk = new TextDecoder().decode(value);
        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error) {
    console.error('Stream chat endpoint error:', error);
    res.write(`data: ${JSON.stringify({
      choices: [{
        delta: {
          content: "Извините, произошла техническая ошибка. Попробуйте позже."
        }
      }]
    })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

/**
 * @swagger
 * /api/chatbot/recommend:
 *   post:
 *     tags: [Chatbot]
 *     summary: Generate detailed flower recommendation
 *     description: Get a structured flower bouquet recommendation based on preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [occasion, budget, preferences]
 *             properties:
 *               occasion:
 *                 type: string
 *                 example: "день рождения"
 *               budget:
 *                 type: string
 *                 example: "3000-5000 руб"
 *               preferences:
 *                 type: string
 *                 example: "яркие цветы, любит розы"
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["красный", "розовый"]
 *     responses:
 *       200:
 *         description: Flower recommendation generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bouquetName:
 *                   type: string
 *                 flowers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 occasion:
 *                   type: string
 *                 priceRange:
 *                   type: string
 *                 description:
 *                   type: string
 *                 careInstructions:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.post('/recommend', async (req, res) => {
  try {
    const { occasion, budget, preferences, colors } = req.body;

    if (!occasion || !budget || !preferences) {
      return res.status(400).json({ 
        error: 'Требуются поля: occasion, budget, preferences' 
      });
    }

    const recommendation = await flowerChatbot.generateFlowerRecommendation(
      occasion,
      budget,
      preferences,
      colors
    );

    res.json(recommendation);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      error: 'Не удалось создать рекомендацию' 
    });
  }
});

/**
 * @swagger
 * /api/chatbot/sentiment:
 *   post:
 *     tags: [Chatbot]
 *     summary: Analyze sentiment of customer message
 *     description: Get sentiment analysis of customer feedback or message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Очень доволен букетом, все цветы свежие!"
 *     responses:
 *       200:
 *         description: Sentiment analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: number
 *                   minimum: 1
 *                   maximum: 5
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *       400:
 *         description: Missing text parameter
 *       500:
 *         description: Internal server error
 */
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Требуется текст для анализа' 
      });
    }

    const sentiment = await flowerChatbot.analyzeSentiment(text);

    res.json(sentiment);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Ошибка анализа настроения' 
    });
  }
});

// Chat analysis route - analyze chat conversation and extract key information
router.post("/analyze", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid messages array" });
    }

    // Создаем естественное описание разговора для формы обратной связи
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    let summary = '';
    
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].content;
      
      // Создаем естественное описание на основе последнего сообщения пользователя
      summary = `Здравствуйте! Я консультировался с Флорой по поводу выбора букета.

Мой запрос: "${lastUserMessage}"

Флора дала полезные рекомендации, но хотел бы обсудить детали с флористом для оформления заказа. Прошу связаться со мной.`;
    } else {
      summary = 'Здравствуйте! Я интересовался букетами через чат с Флорой. Хотел бы получить консультацию флориста для оформления заказа.';
    }

    res.json({ 
      summary: summary,
      success: true 
    });

  } catch (error) {
    console.error('Chat analysis error:', error);
    res.status(500).json({ 
      message: "Ошибка анализа чата",
      summary: "Интересовался букетами через чат. Прошу связаться для консультации и оформления заказа." 
    });
  }
});

export default router;