import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Gift, Calendar, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import GlassCard from "@/components/ui/glass-card";
import LoyaltyModal from "@/components/loyalty-modal";
import type { LoyaltyProgram } from "@shared/schema";

export default function LoyaltySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: loyaltyLevels } = useQuery<LoyaltyProgram[]>({
    queryKey: ["/api/loyalty-program"],
    queryFn: () => fetch("/api/loyalty-program?active=true").then(res => res.json())
  });

  const getIcon = (level: string) => {
    switch (level) {
      case 'beginner': return Star;
      case 'connoisseur': return Crown;
      case 'vip': return Crown;
      default: return Star;
    }
  };

  const getGradient = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-accent to-primary';
      case 'connoisseur': return 'from-primary to-secondary';
      case 'vip': return 'from-secondary to-accent';
      default: return 'from-accent to-primary';
    }
  };

  const getTextColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-accent';
      case 'connoisseur': return 'text-primary';
      case 'vip': return 'text-secondary';
      default: return 'text-accent';
    }
  };

  return (
    <section id="loyalty" className="py-32 bg-gradient-to-br from-muted to-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Программа лояльности</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Становитесь частью нашей цветочной семьи и получайте особые привилегии
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {loyaltyLevels?.map((level, index) => {
            const Icon = getIcon(level.level);
            const isHighlighted = level.level === 'connoisseur';
            
            return (
              <ScrollReveal key={level.id} delay={0.2 + index * 0.1}>
                <GlassCard className={`p-8 text-center glass-hover ${isHighlighted ? 'border-2 border-primary/30' : ''}`}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${getGradient(level.level)} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{level.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {level.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {level.benefits && JSON.parse(level.benefits).map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-center text-muted-foreground">
                        <Star className={`w-4 h-4 mr-3 ${getTextColor(level.level)}`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <div className={`${getTextColor(level.level)} font-bold text-xl`}>
                    {level.minAmount} - {level.maxAmount ? `${level.maxAmount}₽` : 'Безлимит'}
                  </div>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Additional Features */}
        <ScrollReveal delay={0.6}>
          <GlassCard className="p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-6">Дополнительные преимущества</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Gift className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg mb-2">Накопительная система</h4>
                      <p className="text-muted-foreground leading-relaxed">За каждый рубль получайте 1 бонусный балл. 100 баллов = 100 рублей скидки.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Calendar className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg mb-2">Напоминания о событиях</h4>
                      <p className="text-muted-foreground leading-relaxed">Мы запомним важные даты и напомним о них за 3 дня до события.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg mb-2">Программа рефералов</h4>
                      <p className="text-muted-foreground leading-relaxed">Приводите друзей и получайте 500 бонусных баллов за каждого нового клиента.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <img 
                  src="/api/images/loyalty-happy-customers.svg" 
                  alt="Happy customers with flower bouquets" 
                  className="rounded-2xl shadow-2xl mb-8 w-full h-auto"
                />
                
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="floating-action px-10 py-4 text-lg font-bold shadow-2xl group"
                >
                  <Star className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  <span>Присоединиться к программе</span>
                </Button>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-36 h-36 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Loyalty Modal */}
      <LoyaltyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
