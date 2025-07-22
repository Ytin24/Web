import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/scroll-reveal";
import GlassCard from "@/components/ui/glass-card";
import type { BlogPost } from "@shared/schema";

export default function BlogSection() {
  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: () => fetch("/api/blog-posts?published=true").then(res => res.json())
  });

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
                <img 
                  src={post.imageUrl || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1416879595882' : '1487070183336'}-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`} 
                  alt={post.title} 
                  className="w-full h-64 object-cover"
                />
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
                  <a href="#" className="text-[hsl(252,100%,71%)] font-semibold hover:text-[hsl(340,100%,69%)] transition-colors">
                    Читать далее <ArrowRight className="inline w-4 h-4 ml-1" />
                  </a>
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
    </section>
  );
}
