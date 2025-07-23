import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import ChatInterface from './chat-interface';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after a brief delay when component mounts
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide tooltip after 10 seconds
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <>
      {/* Information Tooltip */}
      {showTooltip && !isOpen && (
        <Card className="fixed bottom-24 left-4 max-w-64 shadow-xl border-2 border-pink-200 dark:border-pink-800 bg-background/95 backdrop-blur-sm z-50 animate-in slide-in-from-left-2 fade-in duration-300">
          <CardContent className="p-4 relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTooltip(false)}
              className="absolute top-1 right-1 w-6 h-6 p-0 hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </Button>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">Ф</span>
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Здесь живет ваш AI помощник
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Флора поможет подобрать идеальный букет для любого повода! 🌸
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowTooltip(false);
                    setIsOpen(true);
                  }}
                  className="mt-2 h-7 text-xs bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
                >
                  Начать разговор
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 hover:scale-110 hover:from-pink-500 hover:to-purple-600 shadow-xl transition-all duration-300 z-50 ${isOpen ? 'hidden' : 'flex'} flex-col items-center justify-center pulse-glow`}
        size="sm"
        title="Чат с Флорой"
      >
        <div className="relative flex flex-col items-center">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 backdrop-blur-sm">
            <span className="text-white font-bold text-sm">Ф</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-white/90" />
            <Sparkles className="w-2 h-2 text-white/90 animate-pulse" />
          </div>
        </div>
      </Button>

      {/* Chat Interface */}
      <ChatInterface 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}