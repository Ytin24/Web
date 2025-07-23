import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, Bot, User, Flower, Sparkles, MessageCircle, 
  X, Minimize2, Maximize2, Loader2, Move3D, Flower2, Heart, Zap, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import ContactFormModal from '@/components/contact-form-modal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: {
    rating: number;
    confidence: number;
  };
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function ChatInterface({ isOpen, onClose, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Привет! Меня зовут Флора 🌸 Я ваш персональный AI-флорист!\n\n**Что я умею:**\n• 💐 Подбираю идеальные букеты для любого повода\n• 🌹 Даю советы по уходу за цветами\n• 🎨 Помогаю выбрать цвета и композицию\n• 📞 Направляю к нашим флористам для заказа\n\n**Быстрые команды:**\n• **"Подобрать букет"** - персональная рекомендация\n• **"Букет для мамы"** - готовые идеи для мамы\n• **"Свадебный букет"** - свадебные композиции\n• **"Романтический букет"** - для любимых\n\nПросто расскажите, что ищете! ✨',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 480, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const isMobile = window.innerWidth < 768;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
      // Предотвращаем прокрутку страницы при открытии чата
      document.body.style.overflow = 'hidden';
    } else {
      // Восстанавливаем прокрутку при закрытии чата
      document.body.style.overflow = 'auto';
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isMinimized]);

  // Resize functionality for desktop only
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = chatSize.width;
    const startHeight = chatSize.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const deltaY = startY - e.clientY;
      
      const newWidth = Math.max(400, Math.min(900, startWidth + deltaX));
      const newHeight = Math.max(500, Math.min(800, startHeight + deltaY));
      
      setChatSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isMobile, chatSize]);

  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(prev => {
      const newState = !prev;
      console.log('Toggling minimize:', newState);
      return newState;
    });
  }, []);

  const [isStreaming, setIsStreaming] = useState(false);

  const sendStreamingMessage = async (messages: ChatMessage[]) => {
    setIsStreaming(true);
    
    let streamingMessage: ChatMessage | null = null;

    try {
      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader');
      }

      let accumulatedContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsStreaming(false);
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                  
                  // Создаем или обновляем стриминговое сообщение
                  if (!streamingMessage) {
                    streamingMessage = {
                      role: 'assistant',
                      content: accumulatedContent,
                      timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, streamingMessage!]);
                  } else {
                    // Обновляем последнее сообщение с накопленным содержимым
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessageIndex = newMessages.length - 1;
                      if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                        newMessages[lastMessageIndex] = {
                          ...newMessages[lastMessageIndex],
                          content: accumulatedContent
                        };
                      }
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                console.warn('Failed to parse streaming data:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      // В случае ошибки показываем fallback сообщение
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Извините, произошла техническая ошибка. Попробуйте еще раз через несколько секунд.',
        timestamp: new Date(),
      };
      
      if (streamingMessage) {
        // Если уже есть стриминговое сообщение, заменяем его на ошибку
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
            newMessages[lastMessageIndex] = errorMessage;
          }
          return newMessages;
        });
      } else {
        // Если стриминговое сообщение еще не создано, просто добавляем ошибку
        setMessages(prev => [...prev, errorMessage]);
      }
      
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sentiment: data.sentiment
      };

      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ. Попробуйте еще раз.",
        variant: "destructive",
      });
      console.error('Chat error:', error);
    }
  });

  const analyzeConversationMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      const response = await fetch('/api/chatbot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setContactMessage(data.summary);
      setIsContactModalOpen(true);
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      // Используем базовое сообщение если анализ не удался
      setContactMessage('Интересуется букетами. Прошу связаться для консультации и оформления заказа.');
      setIsContactModalOpen(true);
    },
  });

  const handleContactRequest = () => {
    // Анализируем разговор только если есть сообщения пользователя
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      analyzeConversationMutation.mutate(messages);
    } else {
      // Если разговора еще не было, используем стандартное сообщение
      setContactMessage('Интересуется цветочными услугами. Прошу связаться для консультации.');
      setIsContactModalOpen(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');

    // Используем стриминг для быстрого ответа
    sendStreamingMessage(updatedMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentColor = (sentiment?: { rating: number; confidence: number }) => {
    if (!sentiment || sentiment.confidence < 0.6) return '';
    
    if (sentiment.rating >= 4) return 'text-green-600 dark:text-green-400';
    if (sentiment.rating <= 2) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const quickSuggestions = [
    { text: '💐 Подобрать букет', description: 'Персональная рекомендация' },
    { text: '👩 Букет для мамы', description: 'Готовые идеи для мамы' },
    { text: '💝 Романтический букет', description: 'Для любимых' },
    { text: '💒 Свадебный букет', description: 'Свадебные композиции' },
    { text: '🎉 Праздничный букет', description: 'Для торжеств' },
    { text: '🌷 Весенние цветы', description: 'Сезонные букеты' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="chat-interface" 
        ref={chatRef}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4
        }}
        className={`fixed ${isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'} flex flex-col shadow-2xl z-[9999] transition-all duration-300 ${className} ${
          isResizing ? 'select-none' : ''
        }`}
        style={{
          width: isMobile ? 'calc(100vw - 1rem)' : `${chatSize.width}px`,
          height: isMinimized ? 'auto' : (isMobile ? '80vh' : `${chatSize.height}px`),
          maxWidth: 'calc(100vw - 1rem)',
          maxHeight: 'calc(100vh - 1rem)',
        }}
      >
        <Card className="w-full h-full flex flex-col relative overflow-hidden touch-auto border-0 bg-gradient-to-br from-white/95 via-pink-50/90 to-purple-50/90 dark:from-gray-900/95 dark:via-pink-950/80 dark:to-purple-950/80 backdrop-blur-xl shadow-2xl">
          {/* Animated background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-pink-400/10 via-purple-400/10 to-pink-400/10"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-400/20 rounded-full"
                animate={{
                  x: [0, Math.sin(i) * 30, 0],
                  y: [0, Math.cos(i) * 20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 5 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
                style={{
                  left: `${15 + (i % 6) * 12}%`,
                  top: `${20 + (i % 4) * 15}%`
                }}
              />
            ))}
          </div>
          
          {/* Decorative corner gradients */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-400/15 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/15 to-transparent rounded-tr-full"></div>
          {/* Resize handle - только на desktop */}
          {!isMobile && (
            <motion.div
              ref={resizeRef}
              onMouseDown={handleMouseDown}
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-gradient-to-br from-pink-400/30 to-purple-400/30 hover:from-pink-400/50 hover:to-purple-400/50 transition-all duration-200 flex items-center justify-center group z-20 rounded-br-lg backdrop-blur-sm"
              title="Перетащите для изменения размера"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Move3D className="w-3 h-3 text-white group-hover:text-white drop-shadow-sm" />
            </motion.div>
          )}
          
          {/* Header */}
          <CardHeader className="relative z-10 flex-row items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-b border-pink-200/30 dark:border-pink-800/30">
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative"
                animate={{ 
                  rotate: [0, 2, -2, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Avatar className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 text-white font-bold text-sm relative overflow-hidden">
                    {/* Inner glow */}
                    <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    <Flower2 className="w-5 h-5 relative z-10" />
                  </AvatarFallback>
                </Avatar>
                
                {/* Status indicator with pulse */}
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute inset-0.5 bg-green-400 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      backgroundPosition: ["0%", "100%", "0%"] 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    <CardTitle className="text-sm sm:text-base font-bold">Флора</CardTitle>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </motion.div>
                </div>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-medium">
                    AI-флорист • Онлайн • Готова помочь ✨
                  </span>
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hover:bg-pink-100/70 dark:hover:bg-pink-300/20 hover:text-pink-600 dark:hover:text-pink-300 rounded-full transition-all duration-200"
                    title={isMinimized ? "Развернуть" : "Свернуть"}
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-red-100/70 dark:hover:bg-red-300/20 hover:text-red-600 dark:hover:text-red-300 rounded-full transition-all duration-200"
                  title="Закрыть чат"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full px-3 sm:px-4 py-3">
              <div className="space-y-4 sm:space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'bg-secondary' : 'bg-gradient-to-r from-pink-400 to-purple-400'}`}>
                      <AvatarFallback className={message.role === 'user' ? 'bg-secondary text-white' : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold'}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          'Ф'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 sm:px-6 py-3 sm:py-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm sm:text-base leading-relaxed">
                          {message.role === 'assistant' ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({children}) => <h1 className="text-base font-bold mb-2 text-pink-600 dark:text-pink-400">{children}</h1>,
                                h2: ({children}) => <h2 className="text-sm font-bold mb-2 text-pink-600 dark:text-pink-400">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-pink-600 dark:text-pink-400">{children}</h3>,
                                h4: ({children}) => <h4 className="text-sm font-semibold mb-1 text-pink-600 dark:text-pink-400">{children}</h4>,
                                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({children}) => <li className="text-sm">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-pink-700 dark:text-pink-300">{children}</strong>,
                                em: ({children}) => <em className="italic text-purple-600 dark:text-purple-400">{children}</em>,
                                code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-2 border-pink-400 pl-3 italic text-muted-foreground">{children}</blockquote>,
                              } as Components}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.sentiment && message.sentiment.confidence > 0.6 && (
                          <Badge variant="outline" className={`text-xs ${getSentimentColor(message.sentiment)}`}>
                            {message.sentiment.rating >= 4 ? '😊' : 
                             message.sentiment.rating <= 2 ? '😔' : '😐'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(chatMutation.isPending || (isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user')) && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400">
                      <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold">
                        Ф
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                        <span className="text-sm text-muted-foreground">Флора подбирает букет...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <Separator />

          {/* Quick suggestions (show when no messages yet) */}
          {messages.length === 1 && showSuggestions && (
            <div className="border-t border-border bg-muted/20 p-3 sm:p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">✨ Быстрые предложения:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="w-6 h-6 p-0 hover:bg-pink-100/70 dark:hover:bg-pink-300/20 text-muted-foreground hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                  title="Скрыть предложения"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputValue(suggestion.text);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="text-left h-auto p-2 sm:p-3 bg-background/60 hover:bg-pink-50/70 dark:hover:bg-pink-400/20 border border-border/50 hover:border-pink-300/70 dark:hover:border-pink-400/40 transition-all duration-200"
                    title={suggestion.description}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs font-medium text-foreground truncate w-full">{suggestion.text}</span>
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full">{suggestion.description}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t space-y-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Расскажите Флоре о букете, который нужен..."
                disabled={chatMutation.isPending || isStreaming}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || chatMutation.isPending || isStreaming}
                size="sm"
                className="px-3 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500/90 hover:to-purple-600/90 dark:hover:from-pink-300 dark:hover:to-purple-400 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Contact button - show when user has been chatting */}
            {messages.filter(msg => msg.role === 'user').length > 0 && (
              <Button
                onClick={handleContactRequest}
                disabled={analyzeConversationMutation.isPending}
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 border-green-200/60 hover:border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300 transition-all duration-200"
              >
                {analyzeConversationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Анализирую разговор...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Связаться с флористом
                  </>
                )}
              </Button>
            )}
            
            {/* Show suggestions button when hidden */}
            {messages.length === 1 && !showSuggestions && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(true)}
                  className="text-xs text-muted-foreground hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-400/10 rounded-md px-2 py-1 transition-colors"
                >
                  Показать быстрые предложения
                </Button>
              </div>
            )}
          </div>
        </>
      )}
        </Card>
      </motion.div>
      
      {/* Contact Form Modal */}
      <ContactFormModal
        key="contact-modal"
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialMessage={contactMessage}
        title="Связаться с флористом"
        description="Флора проанализировала наш разговор и подготовила заявку. Наш флорист свяжется с вами для уточнения деталей."
      />
    </AnimatePresence>
  );
}