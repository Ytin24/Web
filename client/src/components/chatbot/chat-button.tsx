import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles, X, Flower2, Heart, Zap } from 'lucide-react';
import ChatInterface from './chat-interface';
import { motion, AnimatePresence } from 'framer-motion';

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
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="fixed bottom-20 sm:bottom-24 left-2 sm:left-4 max-w-72 sm:max-w-64 z-[9998]"
          >
            <Card className="relative shadow-2xl border-0 bg-gradient-to-br from-white/95 via-pink-50/90 to-purple-50/90 dark:from-gray-900/95 dark:via-pink-950/90 dark:to-purple-950/90 backdrop-blur-xl overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-pink-400/20 animate-gradient-x"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-pink-400/40 rounded-full"
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -10, 0],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${20 + (i % 3) * 20}%`
                    }}
                  />
                ))}
              </div>
              
              <CardContent className="p-4 relative z-10">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTooltip(false)}
                  className="absolute top-1 right-1 w-6 h-6 p-0 hover:bg-pink-100/50 dark:hover:bg-pink-300/20 hover:text-pink-600 dark:hover:text-pink-300 rounded-full transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <div className="flex items-start gap-3">
                  <motion.div 
                    className="relative"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden">
                      {/* Inner glow */}
                      <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                      <Flower2 className="w-6 h-6 text-white relative z-10" />
                      
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 border-2 border-pink-300/50 rounded-full"
                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    <motion.h4 
                      className="font-bold text-sm mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                      animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      Встречайте Флору! 
                    </motion.h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Ваш персональный AI-флорист готов помочь подобрать идеальный букет! ✨
                    </p>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowTooltip(false);
                          setIsOpen(true);
                        }}
                        className="h-8 text-xs bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-pink-600 text-white font-medium rounded-full px-4 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Начать разговор
                        <Sparkles className="w-3 h-3 ml-1" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.6
            }}
            className="fixed bottom-3 sm:bottom-4 left-2 sm:left-4 z-[9998]"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Pulse rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-pink-400/30"
                  animate={{ 
                    scale: [1, 1.8, 1], 
                    opacity: [0.6, 0, 0.6] 
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                />
              ))}
              
              <Button
                onClick={() => setIsOpen(true)}
                className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-pink-600 shadow-2xl border-0 overflow-hidden group"
                size="sm"
                title="Чат с Флорой"
              >
                {/* Inner glow effect */}
                <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-300/20 via-purple-300/20 to-pink-300/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Flower2 className="w-7 h-7 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  {/* Floating sparkles */}
                  <motion.div
                    className="absolute"
                    animate={{
                      x: [0, 8, 0],
                      y: [0, -8, 0],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white/90" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute"
                    animate={{
                      x: [0, -6, 0],
                      y: [0, 6, 0],
                      opacity: [0.5, 0.9, 0.5]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <Zap className="w-2 h-2 text-yellow-300" />
                  </motion.div>
                </div>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <ChatInterface 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}