import { useQuery } from "@tanstack/react-query";
import { Award, Heart, Truck } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";
import GlassCard from "@/components/ui/glass-card";
import type { Section } from "@shared/schema";

export default function AboutSection() {
  const { data: aboutSection } = useQuery<Section>({
    queryKey: ["/api/sections", "about"]
  });

  const defaultFeatures = [
    {
      icon: Award,
      title: "Премиальное качество",
      description: "Работаем только с лучшими поставщиками, гарантируя свежесть и красоту каждого цветка"
    },
    {
      icon: Heart,
      title: "Индивидуальный подход",
      description: "Каждая композиция создается с учетом ваших пожеланий и особенностей события"
    },
    {
      icon: Truck,
      title: "Быстрая доставка",
      description: "Доставляем по всему городу в течение 2 часов с момента заказа"
    }
  ];

  let features = defaultFeatures;
  
  if (aboutSection?.content) {
    try {
      const parsedContent = JSON.parse(aboutSection.content);
      if (parsedContent.features) {
        features = parsedContent.features.map((feature: any, index: number) => ({
          icon: defaultFeatures[index]?.icon || Award,
          title: feature.title,
          description: feature.description
        }));
      }
    } catch (error) {
      console.error('Failed to parse about section content:', error);
    }
  }

  return (
    <section id="about" className="section-spacing bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            {aboutSection?.title || "О нас"}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {aboutSection?.description || "Более 15 лет мы создаем незабываемые цветочные композиции, воплощая ваши мечты в реальность"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="overflow-hidden rounded-2xl natural-hover">
            <img 
              src={aboutSection?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
              alt="Interior of flower shop" 
              className="w-full h-auto"
            />
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="natural-card p-4 sm:p-6 natural-hover">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 sm:mr-4 shadow-md">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}

    </section>
  );
}
