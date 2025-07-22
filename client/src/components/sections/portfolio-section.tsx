import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Images, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/scroll-reveal";
import ImageModal from "@/components/image-modal";
import type { PortfolioItem } from "@shared/schema";

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });

  const openImageModal = (imageUrl: string, imageAlt: string) => {
    setSelectedImage({ url: imageUrl, alt: imageAlt });
    setIsImageModalOpen(true);
  };
  
  const { data: portfolioItems } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-items"],
    queryFn: () => fetch("/api/portfolio-items?active=true").then(res => res.json())
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
    <section id="portfolio" className="py-32 bg-gradient-to-br from-background to-muted/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Наши работы</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Галерея наших лучших творений для разных событий и настроений
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
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-foreground/90 bg-card/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={0.3 + index * 0.1}>
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl glass-premium border border-border/50 shadow-xl interactive-card glass-hover cursor-pointer group" onClick={() => item.imageUrl && openImageModal(item.imageUrl, item.title)}>
                  <img 
                    src={item.imageUrl || ''} 
                    alt={item.title} 
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Always visible expand button */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 group-hover:bg-white transition-colors duration-300">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{item.title}</h3>
                      <p className="text-white/95 text-sm mb-3 drop-shadow">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black pointer-events-none">
                          <Maximize2 className="w-4 h-4 mr-1" />
                          Нажмите для увеличения
                        </Button>
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.8}>
          <div className="text-center mt-12">
            <Button 
              onClick={() => window.location.href = '/portfolio'}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Images className="w-5 h-5 mr-2" />
              Посмотреть все работы
            </Button>
          </div>
        </ScrollReveal>
      </div>

      {/* Background Elements */}


      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage.url}
        imageAlt={selectedImage.alt}
      />
    </section>
  );
}
