import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = true, 
  glow = false, 
  interactive = false 
}: EnhancedCardProps) {
  return (
    <div className={cn(
      "bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-xl",
      hover && "glass-hover",
      glow && "pulse-glow",
      interactive && "interactive-card cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}