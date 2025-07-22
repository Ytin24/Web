import { useEffect, useRef } from "react";

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export default function ParallaxContainer({ children, speed = 0.5, className = "" }: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const element = containerRef.current;
        const rect = element.getBoundingClientRect();
        
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={containerRef} className={`${className}`}>
      {children}
    </div>
  );
}
