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
    <section id="portfolio" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(213,27%,19%)] mb-6">Наши работы</h2>
            <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
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
                    ? 'bg-[hsl(252,85%,65%)] text-white shadow-lg' 
                    : 'text-white/90 bg-white/20 backdrop-blur-md hover:bg-[hsl(252,85%,65%)] hover:text-white'
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
                <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer" onClick={() => item.imageUrl && openImageModal(item.imageUrl, item.title)}>
                  <img 
                    src={item.imageUrl || ''} 
                    alt={item.title} 
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{item.title}</h3>
                      <p className="text-white/95 text-sm mb-3 drop-shadow">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black">
                          <Maximize2 className="w-4 h-4 mr-1" />
                          Увеличить
                        </Button>
                        <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
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
            <Button className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Images className="w-5 h-5 mr-2" />
              Посмотреть все работы
            </Button>
          </div>
        </ScrollReveal>
      </div>

      {/* Background Elements */}
      <div className="absolute top-32 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-[hsl(340,100%,69%)]/10 to-[hsl(252,100%,71%)]/10 animate-float"></div>
      <div className="absolute bottom-32 right-20 w-28 h-28 rounded-full bg-gradient-to-br from-[hsl(74,64%,59%)]/10 to-[hsl(340,100%,69%)]/10 animate-float" style={{ animationDelay: '2s' }}></div>

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
