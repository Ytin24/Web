import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDeviceDetection } from '@/hooks/use-device-detection';

export default function FloatingElements() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>();
  const { isMobile, hasReducedMotion, isLowPowerMode } = useDeviceDetection();

  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    });
  }, []);

  useEffect(() => {
    // Отключаем на мобильных и слабых устройствах
    if (isMobile || hasReducedMotion || isLowPowerMode) {
      return;
    }

    // Throttled mouse tracking только для десктопа
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateMousePosition, isMobile, hasReducedMotion, isLowPowerMode]);

  // Мемоизируем анимационные настройки
  const animationSettings = useMemo(() => ({
    transition: { type: "spring", damping: hasReducedMotion ? 50 : 30, stiffness: hasReducedMotion ? 200 : 100 }
  }), [hasReducedMotion]);

  // Не рендерим на мобильных для экономии ресурсов
  if (isMobile || hasReducedMotion || isLowPowerMode) {
    return null;
  }

  // Subtle gradient orbs that react to mouse movement
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Top gradient blur */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 69, 19, 0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * 0.01,
        }}
        transition={animationSettings.transition}
      />
      
      {/* Right gradient blur */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.02) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: mousePosition.x * -0.015,
          y: mousePosition.y * 0.02,
        }}
        transition={animationSettings.transition}
      />

      {/* Bottom gradient blur */}
      <motion.div
        className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.025) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: mousePosition.x * 0.008,
          y: mousePosition.y * -0.012,
        }}
        transition={animationSettings.transition}
      />
    </div>
  );
}
