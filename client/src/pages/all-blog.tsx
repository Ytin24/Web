import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Plus, Maximize2, BookOpen, Search, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { AppleCard, AppleText, AppleButton } from "@/components/animations/apple-interactions";
import ImageModal from "@/components/image-modal";
import type { BlogPost } from "@shared/schema";

export default function AllBlog() {
  const [, setLocation] = useLocation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string }>({ url: '', alt: '' });
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

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

  // Filter and search posts
  const filteredPosts = (blogPosts || []).filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="pt-20">
        {/* Header */}
        <section className="py-20 bg-gradient-to-br from-muted to-background relative overflow-hidden">
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
            
            <div className="text-center mb-12">
              <AppleText>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">Все советы по уходу</h1>
              </AppleText>
              <AppleText className="delay-100">
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Полная коллекция полезных советов от наших флористов для долгой жизни ваших цветов
                </p>
              </AppleText>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-6 mb-12">
                {/* Search Bar */}
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Поиск по советам..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 glass-effect bg-card/50 border-border"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      variant={activeCategory === category ? "default" : "outline"}
                      className={`glass-effect px-6 py-3 rounded-full font-medium transition-all ${
                        activeCategory === category
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'text-foreground/90 bg-card/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border'
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {categoryLabels[category] || category}
                    </Button>
                  ))}
                </div>

                {/* Results Summary */}
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {filteredPosts.length === 0 
                      ? "Советы не найдены"
                      : `Найдено ${filteredPosts.length} ${filteredPosts.length === 1 ? 'совет' : filteredPosts.length < 5 ? 'совета' : 'советов'}`
                    }
                  </p>
                </div>
              </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post, index) => (
                <AppleCard key={post.id}>
                  <article className="bg-card/80 backdrop-blur-sm border border-border shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl hover:bg-card/90 transition-all duration-500 glass-hover hover:scale-[1.02]">
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
                    <div className="p-6 bg-card/95 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                          {post.category}
                        </Badge>
                        {post.createdAt && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer" onClick={() => openBlogPost(post.id)}>
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                        {post.excerpt || post.content.substring(0, 150) + '...'}
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
                </AppleCard>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20 col-span-full">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Советы не найдены</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Попробуйте изменить поисковый запрос" : "В этой категории пока нет статей"}
                </p>
                {(searchQuery || activeCategory !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                      setCurrentPage(1);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="glass-effect"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`glass-effect ${page === currentPage ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="glass-effect"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
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