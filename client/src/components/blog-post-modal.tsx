import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

interface BlogPostModalProps {
  blogPostId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogPostModal({ blogPostId, isOpen, onClose }: BlogPostModalProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { data: blogPost, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${blogPostId}`],
    enabled: !!blogPostId && isOpen,
  });

  if (!isOpen || !blogPostId) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(252,100%,71%)]"></div>
            </div>
          ) : blogPost ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-[hsl(213,27%,19%)] mb-4">
                  {blogPost.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Статья блога: {blogPost.excerpt || blogPost.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Blog post image */}
                {blogPost.imageUrl && (
                  <div className="relative">
                    <img 
                      src={blogPost.imageUrl}
                      alt={blogPost.title}
                      className="w-full h-80 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      <Button variant="secondary" size="sm">
                        Увеличить изображение
                      </Button>
                    </div>
                  </div>
                )}

                {/* Blog post meta */}
                <div className="flex items-center gap-4 text-sm text-[hsl(213,27%,19%)]/70">
                  <Badge className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
                    {blogPost.category}
                  </Badge>
                  {blogPost.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blogPost.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    5 мин чтения
                  </div>
                </div>

                {/* Excerpt */}
                {blogPost.excerpt && (
                  <p className="text-xl text-[hsl(213,27%,19%)]/80 leading-relaxed font-medium">
                    {blogPost.excerpt}
                  </p>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-[hsl(213,27%,19%)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-[hsl(213,27%,19%)]/70">Запись не найдена</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {blogPost?.imageUrl && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={blogPost.imageUrl}
          imageAlt={blogPost.title}
        />
      )}
    </>
  );
}