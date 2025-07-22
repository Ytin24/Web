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
    <section id="blog" className="py-32 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Советы по уходу</h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Полезные советы от наших флористов для долгой жизни ваших цветов
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts?.slice(0, 3).map((post, index) => (
            <ScrollReveal key={post.id} delay={0.2 + index * 0.1}>
              <article className="interactive-card glass-hover bg-card/80 backdrop-blur-sm border border-border shadow-xl rounded-2xl overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img 
                    src={post.imageUrl || '/api/images/blog-care-1.svg'} 
                    alt={post.title} 
                    className="w-full h-64 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110" 
                    onClick={() => openImageModal(post.imageUrl || '', post.title)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 cursor-pointer" onClick={() => openImageModal(post.imageUrl || '', post.title)}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 bg-card/95 backdrop-blur-sm">
                  <div className="flex items-center mb-3">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer" onClick={() => openBlogPost(post.id)}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <button 
                    onClick={() => openBlogPost(post.id)}
                    className="inline-flex items-center text-primary font-semibold hover:text-secondary transition-colors cursor-pointer group"
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
            <Button 
              onClick={() => window.location.href = '/blog'}
              className="glass-effect text-foreground px-8 py-4 rounded-full font-semibold hover:bg-glass-bg transition-all"
            >
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
