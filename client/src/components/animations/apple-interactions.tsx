import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AppleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function AppleButton({ children, onClick, className = '', variant = 'primary' }: AppleButtonProps) {
  const scale = useMotionValue(1);
  const brightness = useMotionValue(1);
  
  const springScale = useSpring(scale, { stiffness: 400, damping: 25 });
  const springBrightness = useSpring(brightness, { stiffness: 300, damping: 20 });

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25';
      case 'secondary':
        return 'bg-white/10 backdrop-blur-md text-foreground border border-white/20 shadow-lg';
      case 'ghost':
        return 'bg-transparent text-foreground hover:bg-white/5';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25';
    }
  };

  return (
    <motion.button
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${getVariantClasses()} ${className}`}
      style={{ 
        scale: springScale,
        filter: useTransform(springBrightness, [1, 1.1], ['brightness(1)', 'brightness(1.1)'])
      }}
      onMouseDown={() => {
        scale.set(0.95);
        brightness.set(1.1);
      }}
      onMouseUp={() => {
        scale.set(1);
        brightness.set(1);
      }}
      onMouseLeave={() => {
        scale.set(1);
        brightness.set(1);
      }}
      onHoverStart={() => {
        scale.set(1.02);
      }}
      onHoverEnd={() => {
        scale.set(1);
      }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

interface AppleCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
}

export function AppleCard({ children, className = '', hoverScale = 1.02 }: AppleCardProps) {
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const shadow = useMotionValue(0);
  
  const springY = useSpring(y, { stiffness: 300, damping: 25 });
  const springScale = useSpring(scale, { stiffness: 400, damping: 25 });
  const springShadow = useSpring(shadow, { stiffness: 300, damping: 20 });

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/80 dark:bg-black/40 border border-white/20 dark:border-white/10 ${className}`}
      style={{
        y: springY,
        scale: springScale,
        boxShadow: useTransform(
          springShadow,
          [0, 1],
          [
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)'
          ]
        )
      }}
      onHoverStart={() => {
        y.set(-8);
        scale.set(hoverScale);
        shadow.set(1);
      }}
      onHoverEnd={() => {
        y.set(0);
        scale.set(1);
        shadow.set(0);
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

interface AppleImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AppleImage({ src, alt, className = '' }: AppleImageProps) {
  const scale = useMotionValue(1);
  const brightness = useMotionValue(1);
  const saturation = useMotionValue(1);

  const springScale = useSpring(scale, { stiffness: 300, damping: 25 });
  const springBrightness = useSpring(brightness, { stiffness: 200, damping: 20 });
  const springSaturation = useSpring(saturation, { stiffness: 200, damping: 20 });

  return (
    <motion.img
      src={src}
      alt={alt}
      className={`transition-all duration-300 ${className}`}
      style={{
        scale: springScale,
        filter: useTransform(
          [springBrightness, springSaturation],
          ([b, s]) => `brightness(${b}) saturate(${s})`
        )
      }}
      onHoverStart={() => {
        scale.set(1.05);
        brightness.set(1.1);
        saturation.set(1.2);
      }}
      onHoverEnd={() => {
        scale.set(1);
        brightness.set(1);
        saturation.set(1);
      }}
    />
  );
}

interface AppleTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AppleText({ children, className = '' }: AppleTextProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}

// Магнитный эффект для интерактивных элементов
export function MagneticElement({ 
  children, 
  strength = 0.3,
  className = '' 
}: { 
  children: React.ReactNode; 
  strength?: number;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  return (
    <motion.div
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        x.set((e.clientX - centerX) * strength);
        y.set((e.clientY - centerY) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}