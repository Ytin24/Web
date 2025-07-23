import { useEffect, useRef, useCallback } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  disableOnMobile?: boolean;
}

export default function ParallaxContainer({ 
  children, 
  speed = 0.5, 
  className = "",
  disableOnMobile = true 
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const { isMobile, hasReducedMotion, isLowPowerMode } = useDeviceDetection();

  const handleScroll = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const element = containerRef.current;
        const rect = element.getBoundingClientRect();
        
        // Оптимизация: обновляем только видимые элементы
        if (rect.bottom >= -100 && rect.top <= window.innerHeight + 100) {
          const yPos = -(scrolled * speed);
          // Используем transform3d для аппаратного ускорения
          element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      }
    });
  }, [speed]);

  useEffect(() => {
    // Отключаем параллакс на мобильных или при reduced motion
    if ((disableOnMobile && isMobile) || hasReducedMotion || isLowPowerMode) {
      return;
    }

    // Throttling с помощью requestAnimationFrame
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleScroll, isMobile, hasReducedMotion, isLowPowerMode, disableOnMobile]);

  return (
    <div 
      ref={containerRef} 
      className={`${className}`}
      style={{
        // Оптимизация рендеринга
        willChange: (disableOnMobile && isMobile) || hasReducedMotion || isLowPowerMode ? 'auto' : 'transform'
      }}
    >
      {children}
    </div>
  );
}
