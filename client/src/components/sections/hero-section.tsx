import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, Phone } from "lucide-react";
import FloatingElements from "@/components/animations/floating-elements";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { useQuery } from "@tanstack/react-query";
import type { Section } from "@shared/schema";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

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
      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        <ScrollReveal delay={0.2}>
          <div className="glass-effect rounded-3xl p-12">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              {heroSection?.title?.split(' ').map((word, index) => 
                word === 'магию' ? (
                  <span key={index} className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    магию{' '}
                  </span>
                ) : word + ' '
              )}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {heroSection?.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={scrollToContact}
                size="xl"
                className="floating-action group relative overflow-hidden px-10 py-4 text-lg font-bold shadow-2xl"
              >
                <Phone className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="relative z-10">Заказать звонок</span>
              </Button>
              <Button 
                onClick={scrollToPortfolio}
                variant="outline"
                size="xl"
                className="border-border/30 text-foreground px-10 py-4 text-lg font-bold hover:bg-glass-bg backdrop-blur-sm shadow-lg hover:shadow-xl group"
              >
                <Play className="w-5 h-5 mr-3 transition-transform group-hover:scale-110 group-hover:translate-x-1" />
                <span>Смотреть работы</span>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="glass-effect rounded-full p-4 cursor-pointer group hover:scale-110 transition-all duration-300 pulse-glow" onClick={() => scrollToSection('about')}>
          <ChevronDown className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </section>
  );
}
