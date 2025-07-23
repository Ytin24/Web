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

    // Создаем контекст разговора для анализа
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'Клиент' : 'Флора'}: ${msg.content}`)
      .join('\n');

    // Создаем естественное описание разговора для формы обратной связи
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    let summary = '';
    
    if (userMessages.length > 0) {
      const fullText = userMessages.map(msg => msg.content).join(' ').toLowerCase();
      
      // Определяем основные темы разговора
      let mainTopics = [];
      let recipient = '';
      let occasion = '';
      let preferences = [];
      let budget = '';
      let urgency = '';
      
      // Получатель
      if (fullText.includes('мам')) recipient = 'маме';
      else if (fullText.includes('жен')) recipient = 'жене';
      else if (fullText.includes('девушк')) recipient = 'девушке';
      else if (fullText.includes('бабушк')) recipient = 'бабушке';
      else if (fullText.includes('сестр')) recipient = 'сестре';
      else if (fullText.includes('подруг')) recipient = 'подруге';
      else if (fullText.includes('коллег')) recipient = 'коллеге';
      
      // Повод
      if (fullText.includes('день рожден') || fullText.includes('др')) occasion = 'на день рождения';
      else if (fullText.includes('8 марта') || fullText.includes('женский день')) occasion = 'на 8 марта';
      else if (fullText.includes('свадьб')) occasion = 'на свадьбу';
      else if (fullText.includes('юбилей')) occasion = 'на юбилей';
      else if (fullText.includes('романтик') || fullText.includes('свидани')) occasion = 'для романтического вечера';
      else if (fullText.includes('извинен') || fullText.includes('прощен')) occasion = 'для примирения';
      
      // Цветы и предпочтения
      if (fullText.includes('роз')) preferences.push('розы');
      if (fullText.includes('пион')) preferences.push('пионы');
      if (fullText.includes('тюльпан')) preferences.push('тюльпаны');
      if (fullText.includes('лилии')) preferences.push('лилии');
      if (fullText.includes('хризантем')) preferences.push('хризантемы');
      if (fullText.includes('герберы')) preferences.push('герберы');
      if (fullText.includes('орхиде')) preferences.push('орхидеи');
      
      // Цвета
      let colors = [];
      if (fullText.includes('розов')) colors.push('розовые');
      if (fullText.includes('красн')) colors.push('красные');
      if (fullText.includes('бел')) colors.push('белые');
      if (fullText.includes('желт')) colors.push('желтые');
      if (fullText.includes('фиолет') || fullText.includes('сирен')) colors.push('фиолетовые');
      
      // Бюджет
      const budgetMatch = fullText.match(/(\d+)\s*(руб|рублей|тысяч|к)/);
      if (budgetMatch) {
        const amount = budgetMatch[1];
        budget = budgetMatch[0].includes('тысяч') || budgetMatch[0].includes('к') 
          ? `в пределах ${amount} тысяч рублей`
          : `бюджет до ${amount} рублей`;
      }
      
      // Срочность
      if (fullText.includes('завтра') || fullText.includes('срочно') || fullText.includes('сегодня')) {
        urgency = 'срочно';
      }
      
      // Составляем естественное сообщение
      let parts = [];
      
      if (recipient && occasion) {
        parts.push(`Клиент обсуждал букет ${recipient} ${occasion}`);
      } else if (recipient) {
        parts.push(`Клиент интересовался букетом ${recipient}`);
      } else if (occasion) {
        parts.push(`Клиент обсуждал букет ${occasion}`);
      } else {
        parts.push('Клиент интересовался букетом');
      }
      
      if (preferences.length > 0) {
        if (colors.length > 0) {
          const flowersText = preferences.length === 1 ? preferences[0] : preferences.join(', ');
          const colorsText = colors.length === 1 ? colors[0] : colors.join(' и ');
          parts.push(`Хотелось бы уточнить возможность сделать букет из ${flowersText} в ${colorsText} тонах`);
        } else {
          const flowersText = preferences.length === 1 ? preferences[0] : preferences.join(', ');
          parts.push(`Хотелось бы уточнить возможность сделать букет из ${flowersText}`);
        }
      } else if (colors.length > 0) {
        parts.push(`Предпочтения по цветам: ${colors.join(', ')}`);
      }
      
      if (budget) {
        parts.push(budget.charAt(0).toUpperCase() + budget.slice(1));
      }
      
      if (urgency) {
        parts.push(`Нужно ${urgency}`);
      }
      
      // Добавляем вежливое окончание
      parts.push('Прошу связаться для уточнения деталей и оформления заказа.');
      
      summary = parts.join('. ') + '.';
      
      // Делаем первую букву заглавной и исправляем грамматику
      summary = summary.charAt(0).toUpperCase() + summary.slice(1);
      
    } else {
      summary = 'Клиент интересовался цветочными композициями. Прошу связаться для консультации и подбора подходящего букета.';
    }

    res.json({ 
      summary: summary,
      success: true 
    });

  } catch (error) {
    console.error('Chat analysis error:', error);
    res.status(500).json({ 
      message: "Ошибка анализа чата",
      summary: "Интересуется букетами. Прошу связаться для консультации и оформления заказа." 
    });
  }
});

export default router;