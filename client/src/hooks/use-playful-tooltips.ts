import { useState, useCallback } from 'react';

type PersonalityType = 'cheerful' | 'wise' | 'excited' | 'caring' | 'mysterious';

interface TooltipContent {
  text: string;
  personality: PersonalityType;
}

const dynamicTooltips: Record<string, TooltipContent[]> = {
  // Main navigation tooltips
  home: [
    { text: 'Добро пожаловать в наш цветочный мир!', personality: 'cheerful' },
    { text: 'Дом, где живут мечты о прекрасном', personality: 'wise' },
    { text: 'Начнем цветочное приключение!', personality: 'excited' }
  ],
  about: [
    { text: 'Узнайте нашу историю любви к цветам', personality: 'caring' },
    { text: 'Секреты нашего мастерства раскрываются...', personality: 'mysterious' },
    { text: 'Мы создаем красоту с 2010 года!', personality: 'wise' }
  ],
  blog: [
    { text: 'Мудрость садовников ждет вас!', personality: 'wise' },
    { text: 'Полезные советы от души к душе', personality: 'caring' },
    { text: 'Секреты цветочного искусства', personality: 'mysterious' }
  ],
  portfolio: [
    { text: 'Наши шедевры ждут восхищения!', personality: 'excited' },
    { text: 'Каждая работа - история любви', personality: 'caring' },
    { text: 'Галерея цветочных чудес', personality: 'cheerful' }
  ],
  
  // Action button tooltips
  order: [
    { text: 'Сделаем заказ мечты вместе!', personality: 'excited' },
    { text: 'Ваше счастье - наша миссия', personality: 'caring' },
    { text: 'Волшебство начинается с заказа!', personality: 'cheerful' }
  ],
  callback: [
    { text: 'Расскажите о своих цветочных мечтах', personality: 'caring' },
    { text: 'Мы всегда готовы помочь!', personality: 'cheerful' },
    { text: 'Ваш звонок - наша радость', personality: 'excited' }
  ],
  chat: [
    { text: 'Флора ждет вашего сообщения!', personality: 'excited' },
    { text: 'Давайте поболтаем о цветах', personality: 'cheerful' },
    { text: 'AI-флорист к вашим услугам', personality: 'wise' }
  ],
  
  // Product category tooltips
  bouquets: [
    { text: 'Букеты, созданные с любовью', personality: 'caring' },
    { text: 'Каждый букет - произведение искусства', personality: 'wise' },
    { text: 'Ого! Столько прекрасных букетов!', personality: 'excited' }
  ],
  plants: [
    { text: 'Живые друзья для вашего дома', personality: 'caring' },
    { text: 'Зеленые спутники жизни', personality: 'wise' },
    { text: 'Растения приносят гармонию', personality: 'mysterious' }
  ],
  wedding: [
    { text: 'Магия свадебного дня в цветах', personality: 'mysterious' },
    { text: 'Самый важный день заслуживает красоты', personality: 'caring' },
    { text: 'Ваша свадьба будет незабываемой!', personality: 'excited' }
  ],
  
  // Admin panel tooltips
  adminCreate: [
    { text: 'Время творить новое!', personality: 'excited' },
    { text: 'Вдохновение ждет воплощения', personality: 'wise' },
    { text: 'Создадим что-то особенное!', personality: 'cheerful' }
  ],
  adminEdit: [
    { text: 'Совершенствуем до идеала', personality: 'wise' },
    { text: 'Каждая деталь важна', personality: 'caring' },
    { text: 'Редактируем с любовью!', personality: 'cheerful' }
  ],
  adminDelete: [
    { text: 'Иногда нужно освобождать место...', personality: 'mysterious' },
    { text: 'Бережно убираем ненужное', personality: 'caring' },
    { text: 'Осторожно! Это навсегда', personality: 'wise' }
  ],
  
  // Form tooltips
  save: [
    { text: 'Сохраняем ваше творение!', personality: 'excited' },
    { text: 'Ваша работа будет сохранена', personality: 'caring' },
    { text: 'Фиксируем момент красоты', personality: 'wise' }
  ],
  cancel: [
    { text: 'Не беда, попробуем еще раз', personality: 'caring' },
    { text: 'Возвращаемся к началу', personality: 'wise' },
    { text: 'Все хорошо, главное - идея!', personality: 'cheerful' }
  ]
};

export function usePlayfulTooltips() {
  const getTooltip = useCallback((key: string): TooltipContent => {
    const tooltips = dynamicTooltips[key];
    if (!tooltips || tooltips.length === 0) {
      return { text: 'Подсказка не найдена', personality: 'cheerful' };
    }

    // Use a simple random selection for now to avoid state issues
    const randomIndex = Math.floor(Math.random() * tooltips.length);
    return tooltips[randomIndex];
  }, []);

  return {
    getTooltip
  };
}