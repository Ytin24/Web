import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowRight, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/scroll-reveal";
import ImageModal from "@/components/image-modal";
import { AppleCard, AppleButton, AppleText, AppleImage, MagneticElement } from "@/components/animations/apple-interactions";
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
        <div className="text-center mb-20">
          <AppleText>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Советы по уходу</h2>
          </AppleText>
          <AppleText className="delay-100">
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Полезные советы от наших флористов для долгой жизни ваших цветов
            </p>
          </AppleText>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts?.slice(0, 3).map((post, index) => (
            <AppleCard key={post.id} className="glass-premium border border-border/50 shadow-xl overflow-hidden group">
              <div className="relative overflow-hidden">
                <AppleImage 
                  src={post.imageUrl || '/api/images/blog-care-1.svg'} 
                  alt={post.title} 
                  className="w-full h-64 object-cover cursor-pointer"
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 cursor-pointer" onClick={() => openImageModal(post.imageUrl || '', post.title)}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 cursor-pointer" 
                     onClick={() => openImageModal(post.imageUrl || '', post.title)}>
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="p-6 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Badge variant="secondary" className="mb-3 bg-primary/90 text-white font-semibold">
                    {post.category || 'Советы'}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 leading-tight drop-shadow-sm">
                  {post.title}
                </h3>
                <p className="text-foreground/80 mb-4 leading-relaxed font-medium drop-shadow-sm">
                  {post.excerpt}
                </p>
                <MagneticElement strength={0.1}>
                  <AppleButton 
                    onClick={() => openBlogPost(post.id)}
                    variant="ghost" 
                    className="w-full justify-between"
                  >
                    Читать далее
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </AppleButton>
                </MagneticElement>
              </div>
            </AppleCard>
          ))}
        </div>

        <div className="text-center mt-12">
          <MagneticElement strength={0.2}>
            <AppleButton 
              onClick={() => setLocation('/all-blog')}
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Больше советов
            </AppleButton>
          </MagneticElement>
        </div>
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
