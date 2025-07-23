import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, X, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Привет! Меня зовут Флора 🌸 Я ваш персональный AI-флорист!

**Что я умею:** 🌺 Подбираю идеальные букеты для любого повода  • 🌹 Даю советы по уходу за цветами • 🌷 Помогаю выбрать цвета и композицию • 📞 Направляю к нашим флористам для заказа

**Быстрые команды:** • "Подобрать букет" - персональная рекомендация • "Букет для мамы" - готовые идеи для мамы`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Hide suggestions after first user message
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length >= 1) {
      const newState = false;
      setShowSuggestions(newState);
      return newState;
    }
  }, []);

  // Simple function to send message with streaming
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const allMessages = [...messages, newUserMessage];
      
      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedContent = '';
      let assistantMessage: ChatMessage | null = null;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setIsTyping(false);
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              
              if (content) {
                accumulatedContent += content;
                
                if (!assistantMessage) {
                  // Create new assistant message
                  assistantMessage = {
                    role: 'assistant',
                    content: accumulatedContent,
                    timestamp: new Date(),
                  };
                  setMessages(prev => [...prev, assistantMessage!]);
                } else {
                  // Update the last message
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: accumulatedContent
                      };
                    }
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
      
      reader.releaseLock();
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleContactRequest = async () => {
    // Analyze conversation if there are user messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length > 0) {
      try {
        // Call analysis and wait for result
        const result = await fetch('/api/chatbot/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        });
        
        if (result.ok) {
          const data = await result.json();
          setContactMessage(data.summary);
        } else {
          setContactMessage('Интересуется букетами. Прошу связаться для консультации и оформления заказа.');
        }
      } catch (error) {
        console.error('Analysis error:', error);
        setContactMessage('Интересуется букетами. Прошу связаться для консультации и оформления заказа.');
      }
    } else {
      // If no conversation yet, use standard message
      setContactMessage('Интересуется цветочными услугами. Прошу связаться для консультации.');
    }
    
    // Close chat and open form
    onClose();
    setTimeout(() => setIsContactModalOpen(true), 300);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    { text: '💐 Подобрать букет', description: 'Персональная рекомендация' },
    { text: '👩 Букет для мамы', description: 'Готовые идеи для мамы' },
    { text: '💝 Романтический букет', description: 'Для любимых' },
    { text: '💒 Свадебный букет', description: 'Свадебные композиции' },
    { text: '🎉 Праздничный букет', description: 'Для торжеств' },
    { text: '🌷 Весенние цветы', description: 'Сезонные букеты' }
  ];

  // Markdown components
  const markdownComponents: Components = {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
    li: ({ children }) => <li className="text-sm">{children}</li>,
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-interface" 
            ref={chatRef}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-[60] w-[320px] sm:w-[400px] md:w-[480px] max-w-[90vw]"
          >
            <Card className="h-[70vh] sm:h-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-pink-200/50 dark:border-purple-600/50 shadow-2xl">
              {/* Header */}
              <CardHeader className="p-3 sm:p-4 bg-gradient-to-r from-pink-400/90 to-purple-500/90 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 bg-white/20 backdrop-blur-sm border-2 border-white/30">
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-lg">
                          🌸
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Флора</h3>
                      <p className="text-xs text-white/80">AI-флорист • Онлайн • Готова помочь</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0 flex flex-col h-full">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold">
                              Ф
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-background border border-border'
                        } rounded-lg p-3 shadow-sm`}>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown 
                              components={markdownComponents}
                              remarkPlugins={[remarkGfm]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold">
                              Я
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400">
                          <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold">
                            Ф
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-background border border-border rounded-lg p-3 shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick suggestions */}
                {showSuggestions && messages.length === 1 && (
                  <div className="p-3 sm:p-4 border-t bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">Быстрые предложения</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSuggestions(false)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
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
                      disabled={isTyping}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
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
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 border-green-200/60 hover:border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300 transition-all duration-200"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Связаться с флористом
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contact Form Modal */}
      <ContactFormModal
        key="contact-modal"
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialMessage={contactMessage}
        title="Связаться с флористом"
        description="Флора проанализировала наш разговор и подготовила заявку. Наш флорист свяжется с вами для уточнения деталей."
      />
    </>
  );
}

export default ChatInterface;