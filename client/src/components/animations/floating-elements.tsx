import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function FloatingElements() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

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
        transition={{ type: "spring", damping: 30 }}
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
        transition={{ type: "spring", damping: 25 }}
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
        transition={{ type: "spring", damping: 35 }}
      />
    </div>
  );
}
