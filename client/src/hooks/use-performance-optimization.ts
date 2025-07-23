import { useEffect } from 'react';
import { useDeviceDetection } from './use-device-detection';

/**
 * Хук для оптимизации производительности на мобильных устройствах
 */
export function usePerformanceOptimization() {
  const { isMobile, hasReducedMotion, isLowPowerMode } = useDeviceDetection();

  useEffect(() => {
    // Добавляем CSS классы для оптимизации
    const root = document.documentElement;
    
    if (isMobile) {
      root.classList.add('mobile-device');
    } else {
      root.classList.remove('mobile-device');
    }
    
    if (hasReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (isLowPowerMode) {
      root.classList.add('low-power-mode');
    } else {
      root.classList.remove('low-power-mode');
    }

    // Настройки CSS для webkit (Safari/iOS)
    if (isMobile) {
      // Оптимизируем прокрутку на iOS
      root.style.setProperty('-webkit-overflow-scrolling', 'touch');
      
      // Отключаем некоторые эффекты для экономии батареи
      root.style.setProperty('--scroll-behavior', 'auto');
      root.style.setProperty('--animation-play-state', hasReducedMotion ? 'paused' : 'running');
    }

    return () => {
      // Cleanup при размонтировании
      root.classList.remove('mobile-device', 'reduced-motion', 'low-power-mode');
    };
  }, [isMobile, hasReducedMotion, isLowPowerMode]);

  return {
    shouldReduceAnimations: isMobile || hasReducedMotion || isLowPowerMode,
    shouldDisableParallax: isMobile,
    shouldReduceBlur: isMobile,
    shouldUseSimpleTransitions: isLowPowerMode
  };
}

/**
 * Debounce функция для оптимизации событий
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle функция для оптимизации событий
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}