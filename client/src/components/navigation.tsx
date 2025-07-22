import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flower, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

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
    { id: "blog", label: "Советы", type: "page", href: "/all-blog" },
    { id: "portfolio", label: "Портфолио", type: "page", href: "/portfolio" },
    { id: "loyalty", label: "Лояльность", type: "section" },
    { id: "contact", label: "Контакты", type: "section" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center pulse-glow transition-all duration-300 group-hover:scale-110">
                <Flower className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">Цветокрафт</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
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
                  className="nav-item text-foreground hover:text-primary font-medium"
                >
                  {link.label}
                </button>
              ))}
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
          <div className="fixed right-0 top-0 h-full w-64 glass-effect p-6 space-y-4 bg-background/95 backdrop-blur-lg border-l border-border" style={{ marginTop: '80px' }}>
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
