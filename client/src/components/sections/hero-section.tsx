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
            <h1 className="text-5xl md:text-7xl font-bold text-white dark:text-gray-100 mb-6 leading-tight">
              {heroSection?.title?.split(' ').map((word, index) => 
                word === 'магию' ? (
                  <span key={index} className="bg-gradient-to-r from-[hsl(340,100%,69%)] to-[hsl(252,100%,71%)] bg-clip-text text-transparent">
                    магию{' '}
                  </span>
                ) : word + ' '
              )}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 dark:text-gray-200/90 mb-8 leading-relaxed">
              {heroSection?.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={scrollToContact}
                className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-2" />
                Заказать звонок
              </Button>
              <Button 
                variant="outline"
                onClick={scrollToPortfolio}
                className="border-white/30 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 hover:text-white transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Смотреть портфолио
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="glass-effect rounded-full p-4">
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </div>
    </section>
  );
}
