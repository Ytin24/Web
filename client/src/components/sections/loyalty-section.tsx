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
      case 'beginner': return 'from-[hsl(74,64%,59%)] to-[hsl(252,100%,71%)]';
      case 'connoisseur': return 'from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)]';
      case 'vip': return 'from-[hsl(340,100%,69%)] to-[hsl(74,64%,59%)]';
      default: return 'from-[hsl(74,64%,59%)] to-[hsl(252,100%,71%)]';
    }
  };

  const getTextColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-[hsl(74,64%,59%)]';
      case 'connoisseur': return 'text-[hsl(252,100%,71%)]';
      case 'vip': return 'text-[hsl(340,100%,69%)]';
      default: return 'text-[hsl(74,64%,59%)]';
    }
  };

  return (
    <section id="loyalty" className="py-32 bg-gradient-to-br from-[hsl(252,100%,71%)]/5 to-[hsl(340,100%,69%)]/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(213,27%,19%)] mb-6">Программа лояльности</h2>
            <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
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
                <GlassCard className={`p-8 text-center glass-hover ${isHighlighted ? 'border-2 border-[hsl(252,100%,71%)]/20' : ''}`}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${getGradient(level.level)} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[hsl(213,27%,19%)] mb-4">{level.title}</h3>
                  <p className="text-[hsl(213,27%,19%)]/70 mb-6 leading-relaxed">
                    {level.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {level.benefits && JSON.parse(level.benefits).map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-center text-[hsl(213,27%,19%)]/70">
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
                <h3 className="text-3xl font-bold text-[hsl(213,27%,19%)] mb-6">Дополнительные преимущества</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(213,27%,19%)] text-lg mb-2">Накопительная система</h4>
                      <p className="text-[hsl(213,27%,19%)]/70 leading-relaxed">За каждый рубль получайте 1 бонусный балл. 100 баллов = 100 рублей скидки.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(340,100%,69%)] to-[hsl(74,64%,59%)] flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(213,27%,19%)] text-lg mb-2">Напоминания о событиях</h4>
                      <p className="text-[hsl(213,27%,19%)]/70 leading-relaxed">Мы запомним важные даты и напомним о них за 3 дня до события.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(74,64%,59%)] to-[hsl(252,100%,71%)] flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(213,27%,19%)] text-lg mb-2">Программа рефералов</h4>
                      <p className="text-[hsl(213,27%,19%)]/70 leading-relaxed">Приводите друзей и получайте 500 бонусных баллов за каждого нового клиента.</p>
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
                  className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Присоединиться к программе
                </Button>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-36 h-36 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)]/10 to-[hsl(340,100%,69%)]/10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(74,64%,59%)]/10 to-[hsl(252,100%,71%)]/10 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Loyalty Modal */}
      <LoyaltyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
