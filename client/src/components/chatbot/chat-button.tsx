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
        className={`fixed bottom-4 left-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-110 shadow-xl transition-all duration-300 z-50 ${isOpen ? 'hidden' : 'flex'}`}
        size="sm"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 text-white" />
          <Sparkles className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
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