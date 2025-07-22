import { ArrowLeft, Flower, Users, Truck, GraduationCap, Heart, Star, Clock, Shield, Award, CheckCircle, Quote, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      popular: true,
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "2-3 часа консультации"
    },
    {
      icon: Users,
      title: "Корпоративное оформление",
      description: "Профессиональное цветочное оформление мероприятий и офисов",
      features: ["Оформление залов", "Настольные композиции", "Фотозоны", "Подарочные букеты"],
      price: "от 15 000 руб",
      popular: false,
      image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "От 1 дня подготовки"
    },
    {
      icon: Truck,
      title: "Доставка цветов",
      description: "Быстрая и надежная доставка по Москве и области",
      features: ["Доставка в день заказа", "Точное время", "SMS уведомления", "Бережная упаковка"],
      price: "от 500 руб",
      popular: false,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "2-4 часа доставка"
    },
    {
      icon: GraduationCap,
      title: "Мастер-классы",
      description: "Обучаем искусству флористики для начинающих и профессионалов",
      features: ["Базовые техники", "Сезонные композиции", "Свадебная флористика", "Сертификат"],
      price: "от 2 500 руб",
      popular: false,
      image: "https://images.unsplash.com/photo-1464047736614-af63643285bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "3-4 часа обучения"
    },
    {
      icon: Flower,
      title: "Праздничные композиции",
      description: "Яркие букеты и композиции для дней рождения и торжеств",
      features: ["Авторские композиции", "Праздничная упаковка", "Открытка в подарок", "Воздушные шары"],
      price: "от 1 500 руб",
      popular: false,
      image: "https://images.unsplash.com/photo-1520367121542-5a9678a7b6b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "1-2 дня изготовление"
    },
    {
      icon: Star,
      title: "VIP обслуживание",
      description: "Премиальный сервис для особых клиентов",
      features: ["Личный флорист", "Эксклюзивные цветы", "24/7 поддержка", "Приоритетная доставка"],
      price: "от 10 000 руб",
      popular: false,
      image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      duration: "Персональный график"
    }
  ];

  const workProcess = [
    {
      step: 1,
      title: "Консультация",
      description: "Обсуждаем ваши пожелания, бюджет и особенности мероприятия",
      icon: MessageCircle
    },
    {
      step: 2,
      title: "Концепция",
      description: "Создаем эскизы и подбираем цветовую гамму композиций",
      icon: Award
    },
    {
      step: 3,
      title: "Изготовление",
      description: "Создаем композиции из свежих цветов по утвержденному дизайну",
      icon: Flower
    },
    {
      step: 4,
      title: "Доставка",
      description: "Бережно доставляем в указанное время и место",
      icon: Truck
    }
  ];

  const testimonials = [
    {
      name: "Анна Петрова",
      role: "Невеста",
      content: "Букет был просто волшебный! Все гости восхищались красотой композиции. Спасибо за профессионализм!",
      avatar: "АП",
      rating: 5
    },
    {
      name: "Михаил Соколов",
      role: "Руководитель компании",
      content: "Оформили корпоративное мероприятие на высшем уровне. Цветочные композиции создали особую атмосферу.",
      avatar: "МС",
      rating: 5
    },
    {
      name: "Елена Васильева",
      role: "Организатор мероприятий",
      content: "Сотрудничаем уже 3 года. Всегда качественно, в срок и с творческим подходом. Рекомендую!",
      avatar: "ЕВ",
      rating: 5
    }
  ];

  const advantages = [
    {
      icon: Shield,
      title: "Гарантия свежести",
      description: "Используем только свежие цветы от проверенных поставщиков"
    },
    {
      icon: Clock,
      title: "Точные сроки",
      description: "Всегда выполняем заказы в оговоренные сроки"
    },
    {
      icon: Award,
      title: "15+ лет опыта",
      description: "Команда профессионалов с многолетним стажем"
    },
    {
      icon: CheckCircle,
      title: "Индивидуальный подход",
      description: "Каждый заказ уникален и выполняется по персональному дизайну"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/50 overflow-x-hidden">
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
                  <Card className="relative bg-white/80 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 h-full overflow-hidden">
                    {service.popular && (
                      <div className="absolute -top-3 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white px-3 py-1">
                          Популярно
                        </Badge>
                      </div>
                    )}
                    
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-[hsl(252,100%,71%)]" />
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-[hsl(213,27%,19%)]">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-[hsl(213,27%,19%)]/70">
                        {service.description}
                      </CardDescription>
                      <div className="flex items-center text-sm text-[hsl(213,27%,19%)]/60 mt-2">
                        <Clock className="w-4 h-4 mr-2" />
                        {service.duration}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-[hsl(213,27%,19%)]/80">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-4 border-t border-border/30">
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

        {/* Advantages Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8">
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[hsl(213,27%,19%)] mb-6">
                  Почему выбирают нас
                </h2>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-2xl mx-auto">
                  Мы гордимся качеством наших услуг и доверием клиентов
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => (
                <ScrollReveal key={advantage.title} delay={0.1 + index * 0.1}>
                  <Card className="text-center bg-white/60 backdrop-blur-sm border border-border/50 hover:bg-white/80 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center mb-4">
                        <advantage.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[hsl(213,27%,19%)] mb-2">
                        {advantage.title}
                      </h3>
                      <p className="text-[hsl(213,27%,19%)]/70">
                        {advantage.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Work Process Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[hsl(213,27%,19%)] mb-6">
                  Как мы работаем
                </h2>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-2xl mx-auto">
                  Простой и понятный процесс от идеи до готовой композиции
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workProcess.map((process, index) => (
                <ScrollReveal key={process.title} delay={0.1 + index * 0.1}>
                  <div className="relative">
                    <Card className="text-center bg-white/80 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center mb-4">
                          <process.icon className="w-8 h-8 text-white" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-[hsl(252,100%,71%)] flex items-center justify-center text-xs font-bold text-[hsl(252,100%,71%)]">
                            {process.step}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-[hsl(213,27%,19%)] mb-2">
                          {process.title}
                        </h3>
                        <p className="text-[hsl(213,27%,19%)]/70">
                          {process.description}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {index < workProcess.length - 1 && (
                      <div className="hidden lg:block absolute top-8 -right-4 z-10">
                        <ArrowRight className="w-8 h-8 text-[hsl(252,100%,71%)]" />
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8">
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-[hsl(213,27%,19%)] mb-6">
                  Отзывы клиентов
                </h2>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-2xl mx-auto">
                  Мнение наших клиентов — лучшая оценка нашей работы
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.name} delay={0.1 + index * 0.1}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                      <Quote className="w-8 h-8 text-[hsl(252,100%,71%)] mb-4" />
                      <p className="text-[hsl(213,27%,19%)]/80 mb-6 italic">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white font-bold">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-[hsl(213,27%,19%)]">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-[hsl(213,27%,19%)]/70">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')] opacity-10 bg-cover bg-center" />
          <div className="relative max-w-4xl mx-auto px-8 text-center">
            <ScrollReveal delay={0.1}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Готовы создать что-то прекрасное?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Свяжитесь с нами для бесплатной консультации и индивидуального расчета стоимости. 
                Мы поможем воплотить ваши идеи в жизнь!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  onClick={scrollToContact}
                  size="lg"
                  className="bg-white text-[hsl(252,100%,71%)] hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Получить консультацию
                </Button>
                <Button 
                  onClick={() => setLocation('/portfolio')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[hsl(252,100%,71%)] px-8 py-4 text-lg font-semibold transition-all duration-300"
                >
                  Смотреть портфолио
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto text-white/90">
                <div className="text-center">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm">лет опыта</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm">довольных клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm">проектов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">поддержка</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}