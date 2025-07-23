import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, Phone } from "lucide-react";
import FloatingElements from "@/components/animations/floating-elements";
import ScrollReveal from "@/components/animations/scroll-reveal";
import PlayfulTooltip from "@/components/ui/playful-tooltip";
import { usePlayfulTooltips } from "@/hooks/use-playful-tooltips";

import { useQuery } from "@tanstack/react-query";
import type { Section } from "@shared/schema";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const { getTooltip } = usePlayfulTooltips();

  const { data: heroSection } = useQuery<Section>({
    queryKey: ["/api/sections", "hero"]
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 parallax-back bg-cover bg-center"
        style={{
          backgroundImage: `url('${heroSection?.imageUrl || 'https://pixabay.com/get/g9c9aa5dd75fa205aa9d66a05583dd6c5e413ba8224957480024235f1f4a3c2cc33358cedb4899fae1f5ac8f8cec65086dc046d534347ba47d7a4b263f4fde7b3_1280.jpg'}')`,
          filter: 'brightness(0.7)',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Floating Rose Elements */}
      <FloatingElements />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="natural-card rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 bg-white/95 backdrop-blur-sm">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight text-balance">
            {heroSection?.title?.split(' ').map((word, index) => 
              word === 'магию' ? (
                <span key={index} className="gradient-text">
                  магию{' '}
                </span>
              ) : word + ' '
            )}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
            {heroSection?.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <PlayfulTooltip
              content={getTooltip('callback').text}
              personality={getTooltip('callback').personality}
              side="top"
              delay={400}
            >
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium shadow-lg natural-hover"
              >
                <Phone className="w-5 h-5 mr-2" />
                Заказать звонок
              </Button>
            </PlayfulTooltip>
            
            <PlayfulTooltip
              content={getTooltip('portfolio').text}
              personality={getTooltip('portfolio').personality}
              side="top"
              delay={400}
            >
              <Button 
                onClick={scrollToPortfolio}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium natural-hover"
              >
                <Play className="w-5 h-5 mr-2" />
                Смотреть работы
              </Button>
            </PlayfulTooltip>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="natural-card rounded-full p-4 cursor-pointer natural-hover" onClick={() => scrollToSection('about')}>
          <ChevronDown className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        </div>
      </div>
    </section>
  );
}
