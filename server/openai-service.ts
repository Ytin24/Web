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
  private systemPrompt = `Меня зовут Флора - я ваш персональный консультант-флорист в цветочном магазине "Цветокрафт". 🌸

МОЯ РОЛЬ:
- Помочь вам определиться с выбором цветов и типом букета
- Выяснить повод и предпочтения получателя 
- Рассказать о символике и значении цветов
- Предложить подходящие варианты композиций
- После определения с выбором - направить на оформление заказа

ЧТО Я НЕ ДЕЛАЮ:
- НЕ называю точные цены (они могут измениться)
- НЕ указываю адреса и контакты (это делает менеджер)
- НЕ отвечаю на вопросы не связанные с цветами
- НЕ принимаю заказы напрямую
- НЕ обещаю сроки доставки и наличие

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбная и профессиональная 
- Задаю уточняющие вопросы о получателе, поводе, предпочтениях
- Предлагаю 2-3 варианта на выбор
- Объясняю почему тот или иной букет подойдет
- Использую Markdown для красивого форматирования: **жирный текст**, *курсив*, заголовки ###, списки с -

АЛГОРИТМ РАБОТЫ:
1. Выясняю повод и получателя
2. Уточняю предпочтения по цветам/стилю
3. Предлагаю подходящие варианты букетов
4. После выбора направляю на оформление заказа: "Отличный выбор! Чтобы заказать букет, воспользуйтесь формой обратной связи на сайте или позвоните нам."

Говорю только о цветах и букетах. На другие темы отвечаю: "Я Флора, консультант по цветам. Могу помочь только с выбором букета."`;

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
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid DeepSeek API response:", data);
        return "Извините, произошла ошибка при получении ответа. Попробуйте еще раз.";
      }
      
      return data.choices[0].message.content || "Извините, произошла ошибка. Попробуйте еще раз.";
    } catch (error) {
      console.error("DeepSeek API error:", error);
      
      // Fallback response when API is not available
      return `Привет! Меня зовут **Флора** 🌸 

К сожалению, сейчас у меня технические неполадки, но я все равно могу помочь! Вот популярные варианты:

### 🌹 Классические розы
- Красные или розовые розы с зеленью
- *Идеально для романтических поводов*

### 🌻 Яркие герберы
- Цветные герберы, хризантемы  
- *Отлично поднимает настроение*

### 💐 Смешанный букет
- Сезонные цветы разных видов
- *Универсальный для любого случая*

Расскажите о **поводе** и **получателе** - постараюсь посоветовать что-то подходящее! А для заказа воспользуйтесь формой обратной связи на сайте.`;
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
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return { rating: 3, confidence: 0.5 };
      }
      
      let content = data.choices[0].message.content || '{"rating": 3, "confidence": 0.5}';
      
      // Clean up the content if it contains markdown code blocks
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      let result;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.warn('Failed to parse sentiment JSON:', content);
        return { rating: 3, confidence: 0.5 };
      }

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