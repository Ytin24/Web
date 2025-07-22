import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { AppleCard, AppleText, AppleButton } from "@/components/animations/apple-interactions";
import FlowerRecommendation from "@/components/chatbot/flower-recommendation";
import { useLocation } from "wouter";

export default function FlowerAI() {
  const [, setLocation] = useLocation();

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
            
            <div className="text-center mb-12">
              <AppleText>
                <h1 className="text-5xl md:text-7xl font-bold text-[hsl(213,27%,19%)] mb-6">
                  AI Флорист
                </h1>
              </AppleText>
              <AppleText className="delay-100">
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
                  Персональные рекомендации букетов на основе искусственного интеллекта
                </p>
              </AppleText>
            </div>
          </div>
        </section>

        {/* Flower Recommendation Component */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <AppleCard>
              <FlowerRecommendation />
            </AppleCard>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}