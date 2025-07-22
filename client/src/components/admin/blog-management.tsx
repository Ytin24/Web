import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Calendar, Search, Save,
  BookOpen, FileText, Bot, Sparkles, Loader2, Lightbulb
} from "lucide-react";
import ContentEditor from "./content-editor";
import BlogAiAssistant from "./blog-ai-assistant";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, InsertBlogPost } from "@shared/schema";

export default function BlogManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: () => fetch("/api/blog-posts").then(res => res.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => 
      apiRequest("POST", "/api/blog-posts", data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setIsCreateOpen(false);
      setShowEditor(false);
      toast({ title: "Статья создана успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при создании статьи", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BlogPost> }) => 
      apiRequest("PUT", `/api/blog-posts/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setEditingPost(null);
      setShowEditor(false);
      toast({ title: "Статья обновлена успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при обновлении статьи", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/blog-posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Статья удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка при удалении статьи", variant: "destructive" });
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      apiRequest("PUT", `/api/blog-posts/${id}`, { isPublished }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Статус публикации изменен" });
    }
  });



  const categories = ["care", "seasonal", "water", "pruning", "fertilizer", "arrangement"];

  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || post.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "published" && post.isPublished) ||
                         (filterStatus === "draft" && !post.isPublished);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const BlogForm = ({ post, onSubmit, onCancel }: {
    post?: BlogPost | null;
    onSubmit: (data: InsertBlogPost) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      category: post?.category || "",
      imageUrl: post?.imageUrl || "",
      isPublished: post?.isPublished || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Заголовок</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Введите заголовок статьи"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="excerpt">Краткое описание</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Краткое описание статьи"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="imageUrl">URL изображения</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="/api/images/blog-care-1.svg"
          />
        </div>

        <div>
          <Label htmlFor="content">Содержание</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Основной текст статьи"
            rows={8}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className="rounded border-border/30"
          />
          <Label htmlFor="isPublished">Опубликовать статью</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </form>
    );
  };

  // Show full-page editor when creating or editing
  if (showEditor) {
    return (
      <ContentEditor
        post={editingPost || undefined}
        onSave={(data) => {
          if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, data });
          } else {
            createMutation.mutate(data as InsertBlogPost);
          }
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(null);
          setIsCreateOpen(false);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Управление блогом</h2>
          <p className="text-muted-foreground">Создание и редактирование статей</p>
        </div>
        <div className="flex gap-2">

          <BlogAiAssistant />
          <Button onClick={() => { setIsCreateOpen(true); setShowEditor(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Новая статья
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Поиск по заголовку..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Категория</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статьи</SelectItem>
                  <SelectItem value="published">Опубликованные</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Статьи не найдены</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Опубликовано" : "Черновик"}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ru-RU') : 'Не указано'}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {post.content.length} символов
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishMutation.mutate({
                        id: post.id,
                        isPublished: !post.isPublished
                      })}
                    >
                      {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { 
                        setEditingPost(post); 
                        setShowEditor(true); 
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Вы уверены, что хотите удалить эту статью?')) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


    </div>
  );
}