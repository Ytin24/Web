import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Gift, Calendar, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { AppleCard, AppleText, AppleButton } from "@/components/animations/apple-interactions";
import GlassCard from "@/components/ui/glass-card";
import LoyaltyModal from "@/components/loyalty-modal";
import type { LoyaltyProgram } from "@shared/schema";
import PlayfulTooltip from "@/components/ui/playful-tooltip";
import { usePlayfulTooltips } from "@/hooks/use-playful-tooltips";

export default function LoyaltySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getTooltip } = usePlayfulTooltips();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-20">
          <AppleText>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">Программа лояльности</h2>
          </AppleText>
          <AppleText className="delay-100">
            <p className="text-base sm:text-lg lg:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Становитесь частью нашей цветочной семьи и получайте особые привилегии
            </p>
          </AppleText>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {loyaltyLevels?.map((level, index) => {
            const Icon = getIcon(level.level);
            const isHighlighted = level.level === 'connoisseur';
            
            return (
              <AppleCard key={level.id}>
                <GlassCard className={`p-6 sm:p-8 text-center glass-hover transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${isHighlighted ? 'border-2 border-primary/30' : ''}`}>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br ${getGradient(level.level)} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{level.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {level.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {level.benefits && (() => {
                      try {
                        const benefits = JSON.parse(level.benefits);
                        return Array.isArray(benefits) ? benefits : [benefits];
                      } catch {
                        return [level.benefits];
                      }
                    })().map((benefit: string, idx: number) => (
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
              </AppleCard>
            );
          })}
        </div>

        {/* Additional Features */}
        <AppleCard>
          <GlassCard className="p-6 sm:p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Дополнительные преимущества</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1">
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-2">Накопительная система</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">За каждый рубль получайте 1 бонусный балл. 100 баллов = 100 рублей скидки.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-2">Напоминания о событиях</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Мы запомним важные даты и напомним о них за 3 дня до события.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 mt-1">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-base sm:text-lg mb-1 sm:mb-2">Программа рефералов</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Приводите друзей и получайте 500 бонусных баллов за каждого нового клиента.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center order-1 md:order-2">
                <img 
                  src="/api/images/loyalty-happy-customers.svg" 
                  alt="Happy customers with flower bouquets" 
                  className="rounded-2xl shadow-2xl mb-6 sm:mb-8 w-full h-auto max-w-sm mx-auto"
                />
                
                <div className="w-full flex justify-center">
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    size="lg"
                    className="floating-action px-4 sm:px-6 md:px-10 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold shadow-2xl group transition-all duration-500 hover:shadow-3xl hover:scale-105 w-full max-w-xs sm:max-w-sm md:w-auto"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform group-hover:scale-110 shrink-0" />
                    <span className="truncate">Присоединиться к программе</span>
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </AppleCard>
      </div>


      
      {/* Loyalty Modal */}
      <LoyaltyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
