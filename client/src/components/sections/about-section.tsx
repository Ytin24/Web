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
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(213,27%,19%)] mb-6">
              {aboutSection?.title || "О нас"}
            </h2>
            <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
              {aboutSection?.description || "Более 15 лет мы создаем незабываемые цветочные композиции, воплощая ваши мечты в реальность"}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <ScrollReveal delay={0.2}>
            <img 
              src={aboutSection?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
              alt="Interior of flower shop" 
              className="rounded-3xl shadow-2xl w-full h-auto"
            />
          </ScrollReveal>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={0.3 + index * 0.1}>
                <GlassCard className="p-8 glass-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center mr-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[hsl(213,27%,19%)]">{feature.title}</h3>
                  </div>
                  <p className="text-[hsl(213,27%,19%)]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)]/10 to-[hsl(340,100%,69%)]/10 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(74,64%,59%)]/10 to-[hsl(252,100%,71%)]/10 animate-float" style={{ animationDelay: '3s' }}></div>
    </section>
  );
}
