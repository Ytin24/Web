import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flower, Menu, X } from "lucide-react";

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
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center">
                <Flower className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[hsl(213,27%,19%)]">Цветокрафт</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-[hsl(213,27%,19%)] hover:text-[hsl(252,100%,71%)] transition-colors"
                >
                  {link.label}
                </button>
              ))}

            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden glass-effect"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 glass-effect p-6 space-y-4" style={{ marginTop: '80px' }}>
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left py-3 px-4 text-[hsl(213,27%,19%)] hover:text-[hsl(252,100%,71%)] hover:bg-white/20 rounded-lg transition-colors"
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
