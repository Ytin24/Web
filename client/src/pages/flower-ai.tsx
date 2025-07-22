import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";

import FlowerRecommendation from "@/components/chatbot/flower-recommendation";
import { useLocation } from "wouter";

export default function FlowerAI() {
  const [, setLocation] = useLocation();

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
            
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                AI Флорист
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Персональные рекомендации букетов на основе искусственного интеллекта
              </p>
            </div>
          </div>
        </section>

        {/* Flower Recommendation Component */}
        <section className="section-spacing">
          <div className="max-w-6xl mx-auto px-8">
            <div className="natural-card p-8">
              <FlowerRecommendation />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}