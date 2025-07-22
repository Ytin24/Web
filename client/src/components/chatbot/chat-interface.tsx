import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, Bot, User, Flower, Sparkles, MessageCircle, 
  X, Minimize2, Maximize2, Loader2 
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
      content: 'Привет! Я ваш личный консультант по цветам. Расскажите мне о случае, для которого нужны цветы, и я помогу подобрать идеальный букет! 🌺',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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
    'Нужен букет на день рождения',
    'Свадебный букет для невесты',
    'Цветы для извинения',
    'Композиция для офиса',
    'Букет на 8 марта'
  ];

  if (!isOpen) return null;

  return (
    <Card className={`fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] ${isMinimized ? 'h-auto' : 'h-[32rem]'} flex flex-col shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 ${className}`}>
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between py-3 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-8 h-8 bg-gradient-to-r from-primary to-secondary">
              <AvatarFallback>
                <Bot className="w-4 h-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">Флорист AI</CardTitle>
            <p className="text-xs text-muted-foreground">Онлайн</p>
          </div>
          <Sparkles className="w-4 h-4 text-primary ml-1" />
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              console.log('Minimize button clicked, current state:', isMinimized);
              setIsMinimized(!isMinimized);
            }}
            className="w-8 h-8 p-0 hover:bg-muted"
            title={isMinimized ? "Развернуть" : "Свернуть"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full px-4 py-2">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'bg-secondary' : 'bg-gradient-to-r from-primary to-secondary'}`}>
                      <AvatarFallback>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col max-w-[75%] ${message.role === 'user' ? 'items-end' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
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
                    <Avatar className="w-8 h-8 bg-gradient-to-r from-primary to-secondary">
                      <AvatarFallback>
                        <Bot className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Печатает...</span>
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
            <div className="p-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Быстрые запросы:</p>
              <div className="flex flex-wrap gap-1">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      setInputValue(suggestion);
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Расскажите о ваших потребностях в цветах..."
                disabled={chatMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || chatMutation.isPending}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}