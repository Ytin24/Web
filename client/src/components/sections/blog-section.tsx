import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/scroll-reveal";
import BlogPostModal from "@/components/blog-post-modal";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

export default function BlogSection() {
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });

  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: () => fetch("/api/blog-posts?published=true").then(res => res.json())
  });

  const openBlogPost = (postId: number) => {
    setSelectedBlogPostId(postId);
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
              <article className="glass-effect rounded-2xl overflow-hidden glass-hover">
                <div className="relative group">
                  <img 
                    src={post.imageUrl || '/api/images/blog-care-1.svg'} 
                    alt={post.title} 
                    className="w-full h-64 object-cover cursor-pointer transition-opacity group-hover:opacity-90"
                    onClick={() => post.imageUrl && openImageModal(post.imageUrl, post.title)}
                  />
                  {post.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <Button variant="secondary" size="sm">
                        Увеличить
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(213,27%,19%)] mb-3">{post.title}</h3>
                  <p className="text-[hsl(213,27%,19%)]/70 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <button 
                    onClick={() => openBlogPost(post.id)}
                    className="text-[hsl(252,100%,71%)] font-semibold hover:text-[hsl(340,100%,69%)] transition-colors cursor-pointer"
                  >
                    Читать далее <ArrowRight className="inline w-4 h-4 ml-1" />
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

      {/* Blog Post Modal */}
      <BlogPostModal
        blogPostId={selectedBlogPostId}
        isOpen={!!selectedBlogPostId}
        onClose={() => setSelectedBlogPostId(null)}
      />

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
