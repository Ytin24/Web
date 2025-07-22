import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  className = ""
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay * 1000);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, isVisible]);

  return (
    <div 
      ref={elementRef}
      className={`scroll-animate ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
