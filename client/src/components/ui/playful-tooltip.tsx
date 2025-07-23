import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlayfulTooltipProps {
  children: React.ReactNode;
  content: string;
  personality?: 'cheerful' | 'wise' | 'excited' | 'caring' | 'mysterious';
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const personalityStyles = {
  cheerful: {
    bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
    border: 'border-yellow-300 dark:border-yellow-600',
    emoji: '🌻',
    bounce: true,
  },
  wise: {
    bg: 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30',
    border: 'border-purple-300 dark:border-purple-600',
    emoji: '🌿',
    bounce: false,
  },
  excited: {
    bg: 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30',
    border: 'border-pink-300 dark:border-pink-600',
    emoji: '🌸',
    bounce: true,
  },
  caring: {
    bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
    border: 'border-green-300 dark:border-green-600',
    emoji: '🌱',
    bounce: false,
  },
  mysterious: {
    bg: 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30',
    border: 'border-gray-300 dark:border-gray-600',
    emoji: '🍃',
    bounce: false,
  },
};

const playfulMessages = {
  cheerful: [
    'Привет! Давайте создадим что-то прекрасное!',
    'О, как замечательно! ✨',
    'Солнышко, вы на правильном пути!',
    'Ура! Это будет потрясающе! 🌞'
  ],
  wise: [
    'Мудрый выбор, как старая ива...',
    'Терпение, как у садовника весной',
    'Знания растут, как корни деревьев',
    'Каждый цветок знает свое время'
  ],
  excited: [
    'Ой-ой-ой! Это так захватывающе!',
    'Не могу сдержать восторг! 🎉',
    'Танцую от радости! 💃',
    'Это просто волшебство!'
  ],
  caring: [
    'Бережно, как с нежным ростком...',
    'Забота - это основа красоты',
    'Ваши руки творят чудеса 💚',
    'Любовь к цветам чувствуется!'
  ],
  mysterious: [
    'Секреты сада открываются...',
    'Шепот ветра среди лепестков...',
    'Тайны природы ждут открытия',
    'В тишине рождается красота...'
  ]
};

export default function PlayfulTooltip({
  children,
  content,
  personality = 'cheerful',
  delay = 500,
  side = 'top',
  className
}: PlayfulTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const personalityTimeoutRef = useRef<NodeJS.Timeout>();
  
  const style = personalityStyles[personality];

  useEffect(() => {
    if (isVisible) {
      personalityTimeoutRef.current = setTimeout(() => {
        setShowPersonality(true);
      }, 1500); // Show personality after 1.5 seconds of hovering
    } else {
      setShowPersonality(false);
      if (personalityTimeoutRef.current) {
        clearTimeout(personalityTimeoutRef.current);
      }
    }

    return () => {
      if (personalityTimeoutRef.current) {
        clearTimeout(personalityTimeoutRef.current);
      }
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getTooltipPosition = () => {
    switch (side) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowPosition = () => {
    switch (side) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  const floatingAnimation = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0,
      x: side === 'left' ? 10 : side === 'right' ? -10 : 0
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: style.bounce ? [0, -2, 0] : 0,
      x: 0,
      transition: {
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        y: style.bounce ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : { duration: 0.2 },
        x: { duration: 0.2 }
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...floatingAnimation}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg border backdrop-blur-sm",
              "min-w-max max-w-xs text-center",
              style.bg,
              style.border,
              getTooltipPosition()
            )}
          >
            {/* Arrow */}
            <div 
              className={cn(
                "absolute w-0 h-0 border-4",
                getArrowPosition(),
                side === 'top' ? `border-t-yellow-300 dark:border-t-yellow-600` : '',
                side === 'bottom' ? `border-b-yellow-300 dark:border-b-yellow-600` : '',
                side === 'left' ? `border-l-yellow-300 dark:border-l-yellow-600` : '',
                side === 'right' ? `border-r-yellow-300 dark:border-r-yellow-600` : ''
              )}
              style={{
                borderTopColor: side === 'top' ? (personality === 'cheerful' ? '#fcd34d' : 
                                  personality === 'wise' ? '#a855f7' :
                                  personality === 'excited' ? '#ec4899' :
                                  personality === 'caring' ? '#10b981' : '#6b7280') : 'transparent',
                borderBottomColor: side === 'bottom' ? (personality === 'cheerful' ? '#fcd34d' : 
                                    personality === 'wise' ? '#a855f7' :
                                    personality === 'excited' ? '#ec4899' :
                                    personality === 'caring' ? '#10b981' : '#6b7280') : 'transparent',
                borderLeftColor: side === 'left' ? (personality === 'cheerful' ? '#fcd34d' : 
                                  personality === 'wise' ? '#a855f7' :
                                  personality === 'excited' ? '#ec4899' :
                                  personality === 'caring' ? '#10b981' : '#6b7280') : 'transparent',
                borderRightColor: side === 'right' ? (personality === 'cheerful' ? '#fcd34d' : 
                                   personality === 'wise' ? '#a855f7' :
                                   personality === 'excited' ? '#ec4899' :
                                   personality === 'caring' ? '#10b981' : '#6b7280') : 'transparent',
              }}
            />
            
            {/* Content */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{style.emoji}</span>
              <span className="text-foreground">
                {showPersonality ? playfulMessages[personality][0] : content}
              </span>
            </div>
            
            {/* Sparkle effect for excited personality */}
            {personality === 'excited' && (
              <motion.div
                className="absolute -top-1 -right-1 text-yellow-400"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✨
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}