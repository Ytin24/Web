import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowRight, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/scroll-reveal";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

export default function BlogSection() {
  const [, setLocation] = useLocation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });

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

  return (
    <section id="blog" className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(213,27%,19%)] mb-6">Советы по уходу</h2>
            <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-3xl mx-auto leading-relaxed">
              Полезные советы от наших флористов для долгой жизни ваших цветов
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts?.slice(0, 3).map((post, index) => (
            <ScrollReveal key={post.id} delay={0.2 + index * 0.1}>
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

        <ScrollReveal delay={0.6}>
          <div className="text-center mt-12">
            <Button className="glass-effect text-[hsl(213,27%,19%)] px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Больше советов
            </Button>
          </div>
        </ScrollReveal>
      </div>

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
