import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flower, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navigationLinks = [
    { id: "about", label: "О нас" },
    { id: "blog", label: "Советы" },
    { id: "portfolio", label: "Портфолио" },
    { id: "loyalty", label: "Лояльность" },
    { id: "contact", label: "Контакты" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center pulse-glow transition-all duration-300 group-hover:scale-110">
                <Flower className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Цветокрафт</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
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
                className="glass-effect border-white/20 text-foreground hover:bg-white/20 dark:border-gray-700 dark:hover:bg-gray-800"
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
                onClick={() => scrollToSection(link.id)}
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
