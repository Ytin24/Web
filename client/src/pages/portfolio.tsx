import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Images, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import ImageModal from "@/components/image-modal";
import type { PortfolioItem } from "@shared/schema";
import { useLocation } from "wouter";

export default function Portfolio() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });

  const openImageModal = (imageUrl: string, imageAlt: string) => {
    setSelectedImage({ url: imageUrl, alt: imageAlt });
    setIsImageModalOpen(true);
  };
  
  const { data: portfolioItems } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-items"],
    queryFn: () => fetch("/api/portfolio-items").then(res => res.json())
  });

  const categories = [
    { key: "all", label: "Все работы" },
    { key: "wedding", label: "Свадебные" },
    { key: "corporate", label: "Корпоративные" },
    { key: "birthday", label: "Праздничные" }
  ];

  const filteredItems = portfolioItems?.filter(item => 
    activeFilter === "all" || item.category === activeFilter
  ) || [];

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
                <h1 className="text-5xl md:text-7xl font-bold text-[hsl(213,27%,19%)] mb-6">Все наши работы</h1>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
                  Полная галерея наших творений для разных событий и настроений
                </p>
              </div>
            </ScrollReveal>

            {/* Portfolio Filter */}
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map((category) => (
                  <Button
                    key={category.key}
                    onClick={() => setActiveFilter(category.key)}
                    variant={activeFilter === category.key ? "default" : "outline"}
                    className={`glass-effect px-6 py-3 rounded-full font-medium transition-all ${
                      activeFilter === category.key 
                        ? 'bg-[hsl(252,85%,65%)] text-white shadow-lg' 
                        : 'text-white/90 bg-white/20 backdrop-blur-md hover:bg-[hsl(252,85%,65%)] hover:text-white'
                    }`}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <ScrollReveal key={item.id} delay={0.1 + (index % 8) * 0.1}>
                  <div className="group">
                    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer" onClick={() => item.imageUrl && openImageModal(item.imageUrl, item.title)}>
                      <img 
                        src={item.imageUrl || ''} 
                        alt={item.title} 
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Always visible expand button */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 group-hover:bg-white transition-colors duration-300">
                        <Maximize2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">{item.title}</h3>
                          <p className="text-white/95 text-sm mb-2 drop-shadow line-clamp-2">{item.description}</p>
                          <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <Images className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">Работы не найдены</h3>
                <p className="text-muted-foreground">В этой категории пока нет работ</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage.url}
        imageAlt={selectedImage.alt}
      />
    </div>
  );
}