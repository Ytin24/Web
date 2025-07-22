import { ArrowLeft, Flower, Users, Truck, GraduationCap, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { useLocation } from "wouter";

export default function Services() {
  const [, setLocation] = useLocation();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, redirect to home with hash
      window.location.href = '/#contact';
    }
  };

  const services = [
    {
      icon: Heart,
      title: "Свадебные букеты",
      description: "Создаем неповторимые букеты для самого важного дня в вашей жизни",
      features: ["Консультация невесты", "Подбор цветов по стилю", "Букет дублёр", "Бутоньерка жениха"],
      price: "от 3 500 руб",
      popular: true
    },
    {
      icon: Users,
      title: "Корпоративное оформление",
      description: "Профессиональное цветочное оформление мероприятий и офисов",
      features: ["Оформление залов", "Настольные композиции", "Фотозоны", "Подарочные букеты"],
      price: "от 15 000 руб",
      popular: false
    },
    {
      icon: Truck,
      title: "Доставка цветов",
      description: "Быстрая и надежная доставка по Москве и области",
      features: ["Доставка в день заказа", "Точное время", "SMS уведомления", "Бережная упаковка"],
      price: "от 500 руб",
      popular: false
    },
    {
      icon: GraduationCap,
      title: "Мастер-классы",
      description: "Обучаем искусству флористики для начинающих и профессионалов",
      features: ["Базовые техники", "Сезонные композиции", "Свадебная флористика", "Сертификат"],
      price: "от 2 500 руб",
      popular: false
    },
    {
      icon: Flower,
      title: "Праздничные композиции",
      description: "Яркие букеты и композиции для дней рождения и торжеств",
      features: ["Авторские композиции", "Праздничная упаковка", "Открытка в подарок", "Воздушные шары"],
      price: "от 1 500 руб",
      popular: false
    },
    {
      icon: Star,
      title: "VIP обслуживание",
      description: "Премиальный сервис для особых клиентов",
      features: ["Личный флорист", "Эксклюзивные цветы", "24/7 поддержка", "Приоритетная доставка"],
      price: "от 10 000 руб",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />
      <main className="pt-20">
        {/* Header */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="glass-effect"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </div>
            
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-bold text-[hsl(213,27%,19%)] mb-6">Наши услуги</h1>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
                  Профессиональные флористические услуги для любых событий и случаев жизни
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ScrollReveal key={service.title} delay={0.1 + index * 0.1}>
                  <Card className="relative bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 h-full">
                    {service.popular && (
                      <div className="absolute -top-3 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white px-3 py-1">
                          Популярно
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center mb-4">
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-[hsl(213,27%,19%)]">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-[hsl(213,27%,19%)]/70">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-[hsl(213,27%,19%)]/80">
                            <div className="w-2 h-2 bg-[hsl(252,100%,71%)] rounded-full mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[hsl(252,100%,71%)]">
                            {service.price}
                          </span>
                          <Button 
                            onClick={scrollToContact}
                            className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Заказать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)]">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <ScrollReveal delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Готовы создать что-то прекрасное?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Свяжитесь с нами для консультации и индивидуального расчета стоимости
              </p>
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-white text-[hsl(252,100%,71%)] hover:bg-white/90 px-8 py-4 text-lg font-semibold"
              >
                Получить консультацию
              </Button>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}