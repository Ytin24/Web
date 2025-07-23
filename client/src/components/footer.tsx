import { Flower, Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Footer() {
  const [location, setLocation] = useLocation();

  const handleNavigation = (sectionId: string) => {
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

  return (
    <footer className="py-20 bg-muted dark:bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-primary/10"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Flower className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Цветокрафт</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Создаем магию из цветов для ваших особенных моментов. Более 15 лет опыта в цветочном искусстве.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/tsvetokraft"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors"
                title="Instagram"
              >
                📷
              </a>
              <a
                href="https://vk.com/tsvetokraft"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors"
                title="VKontakte"
              >
                🌐
              </a>
              <a
                href="https://t.me/tsvetokraft"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors"
                title="Telegram"
              >
                ✈️
              </a>
              <a
                href="https://wa.me/78001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors"
                title="WhatsApp"
              >
                💬
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Быстрые ссылки</h4>
            <nav className="space-y-3">
              {[
                { id: "about", label: "О нас" },
                { id: "blog", label: "Советы по уходу" },
                { id: "portfolio", label: "Портфолио" },
                { id: "loyalty", label: "Программа лояльности" },
                { id: "contact", label: "Контакты" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavigation(link.id)}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Услуги</h4>
            <nav className="space-y-3">
              <a 
                href="/services"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Все услуги
              </a>
              <button
                onClick={() => handleNavigation("portfolio")}
                className="block text-left w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Свадебные букеты
              </button>
              <button
                onClick={() => handleNavigation("portfolio")}
                className="block text-left w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Корпоративное оформление
              </button>
              <button
                onClick={() => handleNavigation("contact")}
                className="block text-left w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                Доставка цветов
              </button>
              <a
                href="mailto:info@tsvetokraft.ru?subject=Мастер-классы"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Мастер-классы
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <a href="tel:88001234567" className="text-muted-foreground hover:text-foreground transition-colors">
                  8 (800) 123-45-67
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <a href="mailto:info@tsvetokraft.ru" className="text-muted-foreground hover:text-foreground transition-colors">
                  info@tsvetokraft.ru
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span className="text-muted-foreground">г. Москва, ул. Цветочная, д. 15</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-primary" />
                <span className="text-muted-foreground">Пн-Вс: 8:00 - 22:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 text-center">
          <p className="text-white/70">
            © 2024 Цветокрафт. Все права защищены. |{" "}
            <a href="/privacy" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </a>{" "}
            |{" "}
            <a href="/terms" className="hover:text-white transition-colors">
              Условия использования
            </a>
          </p>
        </div>
      </div>

      {/* Floating Elements */}

    </footer>
  );
}
