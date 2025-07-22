import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, ArrowLeft } from "lucide-react";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const blogPostId = params.id;

  const { data: blogPost, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${blogPostId}`],
    enabled: !!blogPostId,
  });

  const handleShare = async () => {
    if (navigator.share && blogPost) {
      try {
        await navigator.share({
          title: blogPost.title,
          text: blogPost.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(252,100%,71%)]"></div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[hsl(213,27%,19%)] mb-4">Статья не найдена</h1>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      {typeof document !== 'undefined' && (
        <>
          <title>{blogPost.title} | Цветокрафт - Советы по уходу за цветами</title>
          <meta name="description" content={blogPost.excerpt || blogPost.title} />
          <meta property="og:title" content={blogPost.title} />
          <meta property="og:description" content={blogPost.excerpt || ''} />
          <meta property="og:image" content={blogPost.imageUrl || ''} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={blogPost.title} />
          <meta name="twitter:description" content={blogPost.excerpt || ''} />
          <meta name="twitter:image" content={blogPost.imageUrl || ''} />
        </>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-8 py-12">
          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
                {blogPost.category}
              </Badge>
              {blogPost.createdAt && (
                <div className="flex items-center gap-1 text-[hsl(213,27%,19%)]/70">
                  <Calendar className="w-4 h-4" />
                  {new Date(blogPost.createdAt).toLocaleDateString('ru-RU')}
                </div>
              )}
              <div className="flex items-center gap-1 text-[hsl(213,27%,19%)]/70">
                <Clock className="w-4 h-4" />
                5 мин чтения
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(213,27%,19%)] mb-6 leading-tight">
              {blogPost.title}
            </h1>

            {blogPost.excerpt && (
              <p className="text-xl text-[hsl(213,27%,19%)]/80 leading-relaxed font-medium max-w-3xl">
                {blogPost.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {blogPost.imageUrl && (
            <div className="mb-12">
              <div className="relative group rounded-2xl overflow-hidden glass-effect">
                <img 
                  src={blogPost.imageUrl}
                  alt={blogPost.title}
                  className="w-full h-80 md:h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => setIsImageModalOpen(true)}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Button variant="secondary" size="lg">
                    Увеличить изображение
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-xl max-w-none">
            <div 
              className="text-[hsl(213,27%,19%)] leading-relaxed [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3"
              dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br>') }}
            />
          </div>
        </article>

        {/* Image Modal */}
        {blogPost.imageUrl && (
          <ImageModal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            imageUrl={blogPost.imageUrl}
            imageAlt={blogPost.title}
          />
        )}
      </div>
    </>
  );
}