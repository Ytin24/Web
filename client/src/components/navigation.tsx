import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flower, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppleButton, MagneticElement } from "@/components/animations/apple-interactions";
import { useLocation } from "wouter";
import PlayfulTooltip from "@/components/ui/playful-tooltip";
import { usePlayfulTooltips } from "@/hooks/use-playful-tooltips";
import { API_URL } from '../config';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { getTooltip } = usePlayfulTooltips();

  const handleNavigation = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (location === '/') {
      // If on home page, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other page, navigate to home and then scroll
      setLocation('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const navigationLinks = [
    { id: "about", label: "О нас", type: "section" },
    { id: "services", label: "Услуги", type: "page", href: "/services" },

    { id: "blog", label: "Советы", type: "page", href: "/all-blog" },
    { id: "portfolio", label: "Портфолио", type: "page", href: "/portfolio" },
    { id: "loyalty", label: "Лояльность", type: "section" },
    { id: "contact", label: "Контакты", type: "section" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-premium border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <MagneticElement strength={0.15}>
              <PlayfulTooltip
                content={getTooltip('home').text}
                personality={getTooltip('home').personality}
                side="bottom"
                delay={800}
              >
                <button 
                  onClick={() => setLocation('/')}
                  className="flex items-center space-x-2 sm:space-x-3 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-subtle-pulse">
                    <Flower className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <span className="text-lg sm:text-2xl font-bold gradient-text">Цветокрафт</span>
                </button>
              </PlayfulTooltip>
            </MagneticElement>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationLinks.map((link) => {
                const tooltip = getTooltip(link.id);
                return (
                  <PlayfulTooltip
                    key={link.id}
                    content={tooltip.text}
                    personality={tooltip.personality}
                    side="bottom"
                    delay={600}
                  >
                    <button
                      onClick={() => {
                        if (link.type === 'page' && link.href) {
                          setLocation(link.href);
                        } else {
                          handleNavigation(link.id);
                        }
                      }}
                      className="nav-item text-foreground hover:text-primary font-medium"
                    >
                      {link.label}
                    </button>
                  </PlayfulTooltip>
                );
              })}
              <div className="ml-4">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                className="glass-effect border-border text-foreground hover:bg-glass-bg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 sm:w-64 glass-effect p-4 sm:p-6 space-y-3 sm:space-y-4 bg-background/95 backdrop-blur-lg border-l border-border" style={{ marginTop: '64px' }}>
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.type === 'page' && link.href) {
                    setLocation(link.href);
                  } else {
                    handleNavigation(link.id);
                  }
                }}
                className="block w-full text-left py-3 px-4 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}

          </div>
        </div>
      )}
    </>
  );
}
