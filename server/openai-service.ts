// Using DeepSeek API for flower recommendations and chat
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FlowerRecommendation {
  bouquetName: string;
  flowers: string[];
  colors: string[];
  occasion: string;
  priceRange: string;
  description: string;
  careInstructions: string;
}

export class FlowerChatbotService {
  private systemPrompt = `Ты - эксперт-флорист в цветочном магазине "Цветокрафт" в России. Твоя задача - помочь клиентам выбрать идеальные цветы и букеты.

ТВОИ ВОЗМОЖНОСТИ:
- Рекомендовать цветы и букеты для любых случаев
- Объяснять символику и значение разных цветов
- Давать советы по уходу за цветами
- Помочь с выбором цветовой гаммы
- Предлагать альтернативы в зависимости от бюджета
- Консультировать по сезонности цветов

УСЛУГИ ЦВЕТОКРАФТ:
- Свадебные букеты (от 3500 руб)
- Корпоративное оформление (от 15000 руб) 
- Доставка цветов (от 500 руб)
- Мастер-классы (от 2500 руб)
- Праздничные композиции (от 1500 руб)
- VIP обслуживание (от 10000 руб)

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный и профессиональный
- Используй русский язык
- Задавай уточняющие вопросы о случае, предпочтениях, бюджете
- Будь конкретным в рекомендациях
- Предлагай 2-3 варианта для выбора

ВАЖНО: Всегда предлагай конкретные цветы, цветовые сочетания и ориентировочные цены.`;

  async getChatResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const allMessages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...messages
      ];

      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: allMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || "Извините, произошла ошибка. Попробуйте еще раз.";
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw new Error("Не удалось получить ответ от AI. Проверьте настройки API.");
    }
  }

  async generateFlowerRecommendation(
    occasion: string,
    budget: string,
    preferences: string,
    colors?: string[]
  ): Promise<FlowerRecommendation> {
    try {
      const prompt = `Создай детальную рекомендацию букета для следующих параметров:
Повод: ${occasion}
Бюджет: ${budget}
Предпочтения: ${preferences}
${colors ? `Предпочитаемые цвета: ${colors.join(', ')}` : ''}

Отвечай ТОЛЬКО в формате JSON:
{
  "bouquetName": "название букета",
  "flowers": ["список цветов"],
  "colors": ["список цветов"],
  "occasion": "повод",
  "priceRange": "примерная цена",
  "description": "подробное описание букета",
  "careInstructions": "краткие советы по уходу"
}`;

      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Ты профессиональный флорист. Отвечай только в формате JSON." },
            { role: "user", content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content || '{}');
      
      return {
        bouquetName: result.bouquetName || "Авторский букет",
        flowers: result.flowers || [],
        colors: result.colors || [],
        occasion: result.occasion || occasion,
        priceRange: result.priceRange || "от 2000 руб",
        description: result.description || "Красивый букет из свежих цветов",
        careInstructions: result.careInstructions || "Поставьте в чистую воду, обрежьте стебли"
      };
    } catch (error) {
      console.error("OpenAI recommendation error:", error);
      throw new Error("Не удалось создать рекомендацию букета");
    }
  }

  async analyzeSentiment(text: string): Promise<{ rating: number; confidence: number }> {
    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Проанализируй настроение текста. Оцени от 1 до 5 (1=очень негативно, 5=очень позитивно) и уверенность от 0 до 1. Отвечай JSON: {'rating': число, 'confidence': число}"
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return { rating: 3, confidence: 0.5 };
    }
  }
}

export const flowerChatbot = new FlowerChatbotService();