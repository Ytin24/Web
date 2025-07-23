import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean; 
  isDesktop: boolean;
  isTouchDevice: boolean;
  hasReducedMotion: boolean;
  isLowPowerMode: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    hasReducedMotion: false,
    isLowPowerMode: false
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent) || window.innerWidth < 768;
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent) || (window.innerWidth >= 768 && window.innerWidth < 1024);
      const isDesktop = !isMobile && !isTablet;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Проверяем prefers-reduced-motion
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Примерное определение слабого устройства
      const isLowPowerMode = isMobile && (
        /android.*version\/[0-4]/.test(userAgent) || // Старые Android
        /cpu os [0-9]_/.test(userAgent) || // Старые iOS
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || // Мало ядер процессора
        ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2) // Мало RAM (если поддерживается)
      );

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        hasReducedMotion,
        isLowPowerMode
      });
    };

    checkDevice();
    
    // Обновляем при изменении размера окна
    const handleResize = () => {
      setTimeout(checkDevice, 100); // debounce
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
}