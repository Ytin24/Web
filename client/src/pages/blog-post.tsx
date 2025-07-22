import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, ArrowLeft } from "lucide-react";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

// Simple Markdown renderer
const renderMarkdown = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mt-10 mb-6 text-foreground">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
    .replace(/^- (.*$)/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-2 list-decimal">$1</li>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-6 py-2 my-4 bg-muted/50 italic rounded-r-lg">$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-secondary transition-colors">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg" />')
    .replace(/\n\n/g, '</p><p class="mb-6">')
    .replace(/\n/g, '<br>');
};

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
      <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Статья не найдена</h1>
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

      <div className="min-h-screen bg-gradient-to-br from-muted to-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                {blogPost.category}
              </Badge>
              {blogPost.createdAt && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(blogPost.createdAt).toLocaleDateString('ru-RU')}
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                5 мин чтения
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {blogPost.title}
            </h1>

            {blogPost.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed font-medium max-w-3xl">
                {blogPost.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {blogPost.imageUrl && (
            <div className="mb-12">
              <div className="relative group rounded-2xl overflow-hidden glass-effect cursor-pointer" 
                   onClick={() => setIsImageModalOpen(true)}>
                <img 
                  src={blogPost.imageUrl}
                  alt={blogPost.title}
                  className="w-full h-80 md:h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                  <Button variant="secondary" size="lg" className="pointer-events-none">
                    Увеличить изображение
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-xl max-w-none">
            <div className="text-foreground leading-relaxed">
              <p className="mb-6">
                <span 
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(blogPost.content || '')
                  }}
                />
              </p>
            </div>
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