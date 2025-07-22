import { Flower, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="py-20 bg-[hsl(213,27%,19%)] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,27%,19%)] to-[hsl(252,100%,71%)]/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center">
                <Flower className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Цветокрафт</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Создаем магию из цветов для ваших особенных моментов. Более 15 лет опыта в цветочном искусстве.
            </p>
            <div className="flex space-x-3">
              {[
                { href: "#", icon: "fab fa-instagram" },
                { href: "#", icon: "fab fa-vk" },
                { href: "#", icon: "fab fa-telegram" },
                { href: "#", icon: "fab fa-whatsapp" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(252,100%,71%)] transition-colors"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
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
                  onClick={() => scrollToSection(link.id)}
                  className="block text-white/70 hover:text-white transition-colors"
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
              {[
                "Свадебные букеты",
                "Корпоративное оформление",
                "Доставка цветов",
                "Мастер-классы",
                "Уход за растениями",
              ].map((service) => (
                <a
                  key={service}
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  {service}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-[hsl(252,100%,71%)]" />
                <span className="text-white/70">8 (800) 123-45-67</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-[hsl(252,100%,71%)]" />
                <span className="text-white/70">info@tsvetokraft.ru</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-[hsl(252,100%,71%)]" />
                <span className="text-white/70">г. Москва, ул. Цветочная, д. 15</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-[hsl(252,100%,71%)]" />
                <span className="text-white/70">Пн-Вс: 8:00 - 22:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70">
            © 2024 Цветокрафт. Все права защищены. |{" "}
            <a href="#" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-white transition-colors">
              Условия использования
            </a>
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-20 w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)]/20 to-[hsl(340,100%,69%)]/20 animate-float"></div>
      <div className="absolute bottom-10 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(340,100%,69%)]/20 to-[hsl(74,64%,59%)]/20 animate-float" style={{ animationDelay: '2s' }}></div>
    </footer>
  );
}
