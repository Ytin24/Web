import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Plus, Maximize2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

export default function AllBlog() {
  const [, setLocation] = useLocation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: () => fetch("/api/blog-posts?published=true").then(res => res.json())
  });

  const openBlogPost = (postId: number) => {
    setLocation(`/blog/${postId}`);
  };

  const openImageModal = (imageUrl: string, imageAlt: string) => {
    setSelectedImage({ url: imageUrl, alt: imageAlt });
    setIsImageModalOpen(true);
  };

  // Get unique categories from blog posts
  const categories = ["all", ...Array.from(new Set(blogPosts?.map(post => post.category) || []))];
  const categoryLabels: Record<string, string> = {
    all: "Все советы",
    care: "Уход за цветами", 
    seasonal: "Сезонные советы",
    arrangement: "Композиции"
  };

  const filteredPosts = activeCategory === "all" 
    ? blogPosts || [] 
    : (blogPosts || []).filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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
                <h1 className="text-5xl md:text-7xl font-bold text-[hsl(213,27%,19%)] mb-6">Все советы по уходу</h1>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
                  Полная коллекция полезных советов от наших флористов для долгой жизни ваших цветов
                </p>
              </div>
            </ScrollReveal>

            {/* Category Filter */}
            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    variant={activeCategory === category ? "default" : "outline"}
                    className={`glass-effect px-6 py-3 rounded-full font-medium transition-all ${
                      activeCategory === category
                        ? 'bg-[hsl(252,85%,65%)] text-white shadow-lg' 
                        : 'text-white/90 bg-white/20 backdrop-blur-md hover:bg-[hsl(252,85%,65%)] hover:text-white'
                    }`}
                  >
                    {categoryLabels[category] || category}
                  </Button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <ScrollReveal key={post.id} delay={0.1 + (index % 6) * 0.1}>
                  <article className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl hover:bg-white/90 transition-all duration-300">
                    <div className="relative group">
                      <img 
                        src={post.imageUrl || '/api/images/blog-care-1.svg'} 
                        alt={post.title} 
                        className="w-full h-64 object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageModal(post.imageUrl || '/api/images/blog-care-1.svg', post.title);
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageModal(post.imageUrl || '/api/images/blog-care-1.svg', post.title);
                          }}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 bg-white/95 backdrop-blur-sm">
                      <div className="flex items-center mb-3">
                        <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-[hsl(213,27%,19%)] mb-3 hover:text-[hsl(252,100%,71%)] transition-colors cursor-pointer" onClick={() => openBlogPost(post.id)}>
                        {post.title}
                      </h3>
                      <p className="text-[hsl(213,27%,19%)]/70 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <button 
                        onClick={() => openBlogPost(post.id)}
                        className="inline-flex items-center text-[hsl(252,100%,71%)] font-semibold hover:text-[hsl(340,100%,69%)] transition-colors cursor-pointer group"
                      >
                        Читать далее 
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Советы не найдены</h3>
                <p className="text-gray-500">В этой категории пока нет статей</p>
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