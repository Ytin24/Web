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
    <section id="blog" className="section-spacing bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Советы по уходу
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Полезные советы от наших флористов для долгой жизни ваших цветов
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts?.slice(0, 3).map((post, index) => (
            <div key={post.id} className="natural-card overflow-hidden group">
              <div className="relative overflow-hidden">
                <img 
                  src={post.imageUrl || '/api/images/blog-care-1.svg'} 
                  alt={post.title} 
                  className="w-full h-64 object-cover cursor-pointer natural-hover"
                  onClick={() => openImageModal(post.imageUrl || '', post.title)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white cursor-pointer" 
                     onClick={() => openImageModal(post.imageUrl || '', post.title)}>
                  <Maximize2 className="w-4 h-4 text-foreground" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                    {post.category || 'Советы'}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                  {post.excerpt || post.content?.substring(0, 120) + '...'}
                </p>
                <Button 
                  onClick={() => openBlogPost(post.id)}
                  variant="outline"
                  className="w-full border border-border hover:bg-primary hover:text-white transition-all duration-300 natural-hover"
                >
                  Читать далее
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={() => setLocation('/all-blog')}
            variant="secondary"
            size="lg"
            className="px-8 py-4 text-lg font-medium natural-hover"
          >
            <Plus className="w-5 h-5 mr-2" />
            Больше советов
          </Button>
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
