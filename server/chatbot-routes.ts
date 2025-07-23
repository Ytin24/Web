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

    // Простой анализ без использования AI - извлекаем ключевые слова
    let summary = '';
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
    const fullText = userMessages.join(' ');
    
    // Определяем тип цветов
    const flowerTypes = [];
    if (fullText.includes('роз')) flowerTypes.push('розы');
    if (fullText.includes('пион')) flowerTypes.push('пионы');
    if (fullText.includes('тюльпан')) flowerTypes.push('тюльпаны');
    if (fullText.includes('лилии')) flowerTypes.push('лилии');
    if (fullText.includes('хризантем')) flowerTypes.push('хризантемы');
    
    // Определяем повод
    let occasion = '';
    if (fullText.includes('день рожден') || fullText.includes('др')) occasion = 'день рождения';
    else if (fullText.includes('свадьб')) occasion = 'свадьба';
    else if (fullText.includes('8 марта') || fullText.includes('женский день')) occasion = '8 марта';
    else if (fullText.includes('романтик') || fullText.includes('любим')) occasion = 'романтический повод';
    else if (fullText.includes('мам')) occasion = 'для мамы';
    
    // Определяем цвета
    const colors = [];
    if (fullText.includes('розов')) colors.push('розовые');
    if (fullText.includes('красн')) colors.push('красные');
    if (fullText.includes('бел')) colors.push('белые');
    if (fullText.includes('желт')) colors.push('желтые');
    
    // Определяем бюджет
    let budget = '';
    const budgetMatch = fullText.match(/(\d+)\s*(руб|рублей|тысяч|к)/);
    if (budgetMatch) {
      budget = `до ${budgetMatch[1]} руб`;
    }
    
    // Определяем срочность
    let urgency = '';
    if (fullText.includes('завтра') || fullText.includes('срочно') || fullText.includes('сегодня')) {
      urgency = 'Срочно';
    }
    
    // Составляем итоговое сообщение
    const parts = [];
    if (flowerTypes.length > 0) parts.push(`Интересуется: ${flowerTypes.join(', ')}`);
    if (occasion) parts.push(`Повод: ${occasion}`);
    if (colors.length > 0) parts.push(`Цвета: ${colors.join(', ')}`);
    if (budget) parts.push(`Бюджет: ${budget}`);
    if (urgency) parts.push(urgency);
    
    if (parts.length > 0) {
      summary = parts.join('. ') + '.';
    } else {
      summary = 'Интересуется букетами. Прошу связаться для консультации и оформления заказа.';
    }
    
    // Ограничиваем длину до 200 символов
    if (summary.length > 200) {
      summary = summary.substring(0, 197) + '...';
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