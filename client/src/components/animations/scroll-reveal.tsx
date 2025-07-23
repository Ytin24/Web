import { useEffect, useRef, useState, useCallback } from "react";
import { useDeviceDetection } from "@/hooks/use-device-detection";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
  disableOnMobile?: boolean;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  className = "",
  disableOnMobile = false
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile, hasReducedMotion, isLowPowerMode } = useDeviceDetection();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isVisible) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delay * 1000);
      }
    });
  }, [delay, isVisible]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Для слабых устройств или reduced motion - показываем сразу без анимации
    if ((disableOnMobile && isMobile) || hasReducedMotion || isLowPowerMode) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: isMobile ? Math.min(threshold, 0.05) : threshold, // Более чувствительный threshold на мобильных
      rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px' // Меньший отступ на мобильных
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, threshold, isMobile, hasReducedMotion, isLowPowerMode, disableOnMobile]);

  return (
    <div 
      ref={elementRef}
      className={`scroll-animate ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        // Оптимизация рендеринга
        willChange: ((disableOnMobile && isMobile) || hasReducedMotion || isLowPowerMode) ? 'auto' : 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
