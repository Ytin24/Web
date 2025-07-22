import { ArrowLeft, Flower, Users, Truck, GraduationCap, Heart, Star, Clock, Shield, Award, CheckCircle, Quote, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLocation } from "wouter";

export default function Services() {
  const [, setLocation] = useLocation();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
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
      title: "Быстрое исполнение",
      description: "Выполняем заказы в кратчайшие сроки без потери качества"
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="pt-20">
        {/* Header */}
        <section className="section-spacing bg-background relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="natural-hover"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
                Наши услуги
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Профессиональные флористические услуги для любых событий и случаев жизни
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-spacing bg-background">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Полный спектр услуг
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Создаем незабываемые моменты для каждого особого события в вашей жизни
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={service.title} className="natural-card h-full overflow-hidden group natural-hover">
                  {service.popular && (
                    <div className="absolute -top-3 left-4 z-10">
                      <Badge className="bg-primary text-white px-3 py-1">
                        Популярно
                      </Badge>
                    </div>
                  )}
                  
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover natural-hover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 mr-1 text-primary" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-primary">{service.price}</p>
                        <p className="text-xs text-muted-foreground">{service.duration}</p>
                      </div>
                      <Button
                        onClick={scrollToContact}
                        size="sm"
                        className="natural-hover"
                      >
                        Заказать
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Work Process */}
        <section className="section-spacing bg-muted/30">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Как мы работаем
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Четко структурированный процесс от идеи до воплощения
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workProcess.map((step, index) => (
                <div key={step.step} className="natural-card p-6 text-center natural-hover">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-primary font-medium mb-2">Шаг {step.step}</div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="section-spacing bg-background">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Наши преимущества
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Почему клиенты выбирают именно нас
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => (
                <div key={advantage.title} className="natural-card p-6 text-center natural-hover">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <advantage.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-spacing bg-muted/30">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Отзывы клиентов
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Что говорят о нас наши клиенты
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.name} className="natural-card p-6 natural-hover">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-spacing bg-background">
          <div className="max-w-6xl mx-auto px-8">
            <div className="natural-card p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Готовы создать что-то прекрасное?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Свяжитесь с нами для консультации и обсуждения вашего проекта
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={scrollToContact}
                  size="lg"
                  className="px-8 py-4 text-lg natural-hover"
                >
                  Заказать консультацию
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/portfolio')}
                  size="lg"
                  className="px-8 py-4 text-lg natural-hover"
                >
                  Посмотреть работы
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}