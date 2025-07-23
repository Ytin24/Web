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
  X, Minimize2, Maximize2, Loader2, Move3D 
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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

    chatMutation.mutate(updatedMessages);
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
    <div 
      ref={chatRef}
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
      <Card className="w-full h-full flex flex-col bg-background/95 backdrop-blur-sm border-2 border-primary/20 relative overflow-hidden touch-auto">
        {/* Resize handle - только на desktop */}
        {!isMobile && (
          <div
            ref={resizeRef}
            onMouseDown={handleMouseDown}
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-primary/20 hover:bg-primary/40 transition-colors flex items-center justify-center group z-10"
            title="Перетащите для изменения размера"
          >
            <Move3D className="w-3 h-3 text-primary/60 group-hover:text-primary" />
          </div>
        )}
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-purple-400">
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-sm">
                Ф
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-semibold">Флора</CardTitle>
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-xs text-muted-foreground bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              AI-флорист • Онлайн • Готова помочь
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMinimizeToggle}
            className="w-8 h-8 p-0 hover:bg-muted/50 transition-colors"
            title={isMinimized ? "Развернуть" : "Свернуть"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
            title="Закрыть чат"
          >
            <X className="w-4 h-4" />
          </Button>
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
                
                {chatMutation.isPending && (
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
          {messages.length === 1 && (
            <div className="border-t border-border bg-muted/20 p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium">✨ Быстрые предложения:</p>
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
                    className="text-left h-auto p-2 sm:p-3 bg-background/60 hover:bg-primary/10 border border-border/50 hover:border-primary/50 transition-all duration-200"
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
          <div className="p-3 sm:p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Расскажите Флоре о букете, который нужен..."
                disabled={chatMutation.isPending}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || chatMutation.isPending}
                size="sm"
                className="px-3 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      </Card>
    </div>
  );
}