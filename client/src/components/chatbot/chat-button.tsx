import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import ChatInterface from './chat-interface';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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