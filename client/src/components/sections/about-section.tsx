import { useQuery } from "@tanstack/react-query";
import { Award, Heart, Truck } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { AppleCard, AppleText, MagneticElement } from "@/components/animations/apple-interactions";
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
    <section id="about" className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <AppleText>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {aboutSection?.title || "О нас"}
            </h2>
          </AppleText>
          <AppleText className="delay-100">
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              {aboutSection?.description || "Более 15 лет мы создаем незабываемые цветочные композиции, воплощая ваши мечты в реальность"}
            </p>
          </AppleText>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <AppleCard className="overflow-hidden">
            <MagneticElement>
              <img 
                src={aboutSection?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                alt="Interior of flower shop" 
                className="rounded-3xl shadow-2xl w-full h-auto transition-transform duration-700 hover:scale-105"
              />
            </MagneticElement>
          </AppleCard>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <AppleCard key={index}>
                <GlassCard className="p-8 glass-hover transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-4">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </AppleCard>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}

    </section>
  );
}
