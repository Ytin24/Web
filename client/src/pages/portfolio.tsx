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
                Все наши работы
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Полная галерея наших творений для разных событий и настроений
              </p>
            </div>

            {/* Portfolio Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  variant={activeFilter === category.key ? "default" : "outline"}
                  className="natural-hover"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="section-spacing bg-background">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item.id} className="natural-card overflow-hidden group">
                  <div className="relative overflow-hidden cursor-pointer" onClick={() => item.imageUrl && openImageModal(item.imageUrl, item.title)}>
                    <img 
                      src={item.imageUrl || ''} 
                      alt={item.title} 
                      className="w-full h-64 object-cover natural-hover"
                    />
                    
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
                      <Maximize2 className="w-4 h-4 text-foreground" />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-white/90 text-sm mb-2">{item.description}</p>
                        <Badge className="bg-primary text-white text-xs">
                          {categories.find(cat => cat.key === item.category)?.label || item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
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