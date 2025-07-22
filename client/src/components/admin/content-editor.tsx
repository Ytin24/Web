import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Plus, Edit, Trash2, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import type { Section, BlogPost, PortfolioItem, LoyaltyProgram } from "@shared/schema";

type AdminSection = "about" | "blog" | "portfolio" | "loyalty";

interface ContentEditorProps {
  section: AdminSection;
}

const sectionSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  description: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const blogPostSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Содержание обязательно"),
  imageUrl: z.string().optional(),
  category: z.string().min(1, "Категория обязательна"),
  isPublished: z.boolean().default(false),
});

const portfolioItemSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Изображение обязательно"),
  category: z.string().min(1, "Категория обязательна"),
  isActive: z.boolean().default(true),
});

const loyaltyLevelSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  minAmount: z.number().min(0, "Минимальная сумма не может быть отрицательной"),
  maxAmount: z.number().nullable(),
  discount: z.number().min(0).max(100, "Скидка не может превышать 100%"),
  benefits: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function ContentEditor({ section }: ContentEditorProps) {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Section-specific data fetching
  const { data: sectionData, isLoading: sectionLoading } = useQuery({
    queryKey: ["/api/sections", section],
    enabled: section === "about",
  });

  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ["/api/blog-posts"],
    enabled: section === "blog",
  });

  const { data: portfolioItems, isLoading: portfolioLoading } = useQuery({
    queryKey: ["/api/portfolio-items"],
    enabled: section === "portfolio",
  });

  const { data: loyaltyLevels, isLoading: loyaltyLoading } = useQuery({
    queryKey: ["/api/loyalty-program"],
    enabled: section === "loyalty",
  });

  // Forms
  const sectionForm = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const blogForm = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      category: "",
      isPublished: false,
    },
  });

  const portfolioForm = useForm<z.infer<typeof portfolioItemSchema>>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      isActive: true,
    },
  });

  const loyaltyForm = useForm<z.infer<typeof loyaltyLevelSchema>>({
    resolver: zodResolver(loyaltyLevelSchema),
    defaultValues: {
      title: "",
      description: "",
      minAmount: 0,
      maxAmount: null,
      discount: 0,
      benefits: "",
      isActive: true,
    },
  });

  // Mutations
  const updateSectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sectionSchema>) => {
      return apiRequest("PUT", `/api/sections/${sectionData?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({ title: "Раздел обновлен", description: "Изменения успешно сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blogPostSchema>) => {
      return apiRequest("POST", "/api/blog-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setIsCreating(false);
      blogForm.reset();
      toast({ title: "Статья создана", description: "Новая статья успешно добавлена" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать статью", variant: "destructive" });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blogPostSchema>) => {
      return apiRequest("PUT", `/api/blog-posts/${editingItem.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setEditingItem(null);
      toast({ title: "Статья обновлена", description: "Изменения успешно сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/blog-posts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Статья удалена", description: "Статья успешно удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить статью", variant: "destructive" });
    },
  });

  const createPortfolioItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof portfolioItemSchema>) => {
      return apiRequest("POST", "/api/portfolio-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      setIsCreating(false);
      portfolioForm.reset();
      toast({ title: "Работа добавлена", description: "Новая работа успешно добавлена в портфолио" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось добавить работу", variant: "destructive" });
    },
  });

  const updatePortfolioItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof portfolioItemSchema>) => {
      return apiRequest("PUT", `/api/portfolio-items/${editingItem.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      setEditingItem(null);
      toast({ title: "Работа обновлена", description: "Изменения успешно сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
    },
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/portfolio-items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      toast({ title: "Работа удалена", description: "Работа успешно удалена из портфолио" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить работу", variant: "destructive" });
    },
  });

  const updateLoyaltyLevelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loyaltyLevelSchema> & { id: number }) => {
      const { id, ...updateData } = data;
      return apiRequest("PUT", `/api/loyalty-program/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-program"] });
      setEditingItem(null);
      toast({ title: "Уровень обновлен", description: "Изменения успешно сохранены" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось сохранить изменения", variant: "destructive" });
    },
  });

  // Effects for populating forms when editing
  useEffect(() => {
    if (section === "about" && sectionData) {
      sectionForm.reset({
        title: sectionData.title,
        description: sectionData.description || "",
        content: sectionData.content || "",
        imageUrl: sectionData.imageUrl || "",
        isActive: sectionData.isActive,
      });
    }
  }, [sectionData, sectionForm, section]);

  useEffect(() => {
    if (editingItem && section === "blog") {
      blogForm.reset({
        title: editingItem.title,
        excerpt: editingItem.excerpt || "",
        content: editingItem.content,
        imageUrl: editingItem.imageUrl || "",
        category: editingItem.category,
        isPublished: editingItem.isPublished,
      });
    } else if (editingItem && section === "portfolio") {
      portfolioForm.reset({
        title: editingItem.title,
        description: editingItem.description || "",
        imageUrl: editingItem.imageUrl,
        category: editingItem.category,
        isActive: editingItem.isActive,
      });
    } else if (editingItem && section === "loyalty") {
      loyaltyForm.reset({
        title: editingItem.title,
        description: editingItem.description || "",
        minAmount: editingItem.minAmount,
        maxAmount: editingItem.maxAmount,
        discount: editingItem.discount,
        benefits: editingItem.benefits || "",
        isActive: editingItem.isActive,
      });
    }
  }, [editingItem, section, blogForm, portfolioForm, loyaltyForm]);

  // Loading states
  const isLoading = sectionLoading || blogLoading || portfolioLoading || loyaltyLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3">Загрузка...</span>
        </CardContent>
      </Card>
    );
  }

  // About Section Editor
  if (section === "about") {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Редактирование раздела "О нас"</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...sectionForm}>
            <form
              onSubmit={sectionForm.handleSubmit((data) => updateSectionMutation.mutate(data))}
              className="space-y-6"
            >
              <FormField
                control={sectionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sectionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sectionForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <div className="flex space-x-4">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/image.jpg"
                          className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                        />
                      </FormControl>
                      <Button type="button" variant="outline" className="glass-effect">
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sectionForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Активен</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Отображать раздел на сайте
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateSectionMutation.isPending}
                className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSectionMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Blog Section Editor
  if (section === "blog") {
    return (
      <div className="space-y-6">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Управление блогом</CardTitle>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новая статья
            </Button>
          </CardHeader>
          <CardContent>
            {(isCreating || editingItem) && (
              <Form {...blogForm}>
                <form
                  onSubmit={blogForm.handleSubmit((data) =>
                    isCreating
                      ? createBlogPostMutation.mutate(data)
                      : updateBlogPostMutation.mutate(data)
                  )}
                  className="space-y-4 mb-8 p-6 glass-effect rounded-lg"
                >
                  <h3 className="text-lg font-semibold">
                    {isCreating ? "Создание новой статьи" : "Редактирование статьи"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={blogForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Заголовок</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blogForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]">
                                <SelectValue placeholder="Выберите категорию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Основы ухода">Основы ухода</SelectItem>
                              <SelectItem value="Секреты свежести">Секреты свежести</SelectItem>
                              <SelectItem value="Сезонность">Сезонность</SelectItem>
                              <SelectItem value="Флористика">Флористика</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={blogForm.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Краткое описание</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={blogForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Содержание</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={blogForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL изображения</FormLabel>
                        <div className="flex space-x-4">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com/image.jpg"
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <Button type="button" variant="outline" className="glass-effect">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузить
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={blogForm.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Опубликовано</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Показывать статью на сайте
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={createBlogPostMutation.isPending || updateBlogPostMutation.isPending}
                      className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? "Создать статью" : "Сохранить изменения"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(null);
                        blogForm.reset();
                      }}
                      className="glass-effect"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="space-y-4">
              {blogPosts?.map((post: BlogPost) => (
                <div key={post.id} className="flex items-center justify-between p-4 glass-effect rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{post.category}</Badge>
                          <Badge variant={post.isPublished ? "default" : "secondary"}>
                            {post.isPublished ? "Опубликовано" : "Черновик"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(post)}
                      className="glass-effect"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBlogPostMutation.mutate(post.id)}
                      disabled={deleteBlogPostMutation.isPending}
                      className="glass-effect text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Portfolio Section Editor
  if (section === "portfolio") {
    return (
      <div className="space-y-6">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Управление портфолио</CardTitle>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новая работа
            </Button>
          </CardHeader>
          <CardContent>
            {(isCreating || editingItem) && (
              <Form {...portfolioForm}>
                <form
                  onSubmit={portfolioForm.handleSubmit((data) =>
                    isCreating
                      ? createPortfolioItemMutation.mutate(data)
                      : updatePortfolioItemMutation.mutate(data)
                  )}
                  className="space-y-4 mb-8 p-6 glass-effect rounded-lg"
                >
                  <h3 className="text-lg font-semibold">
                    {isCreating ? "Добавление новой работы" : "Редактирование работы"}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={portfolioForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={portfolioForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]">
                                <SelectValue placeholder="Выберите категорию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="wedding">Свадебные</SelectItem>
                              <SelectItem value="corporate">Корпоративные</SelectItem>
                              <SelectItem value="birthday">Праздничные</SelectItem>
                              <SelectItem value="sympathy">Траурные</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={portfolioForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={portfolioForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL изображения *</FormLabel>
                        <div className="flex space-x-4">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com/image.jpg"
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <Button type="button" variant="outline" className="glass-effect">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузить
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={portfolioForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Активна</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Показывать работу в портфолио
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={createPortfolioItemMutation.isPending || updatePortfolioItemMutation.isPending}
                      className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? "Добавить работу" : "Сохранить изменения"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingItem(null);
                        portfolioForm.reset();
                      }}
                      className="glass-effect"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {portfolioItems?.map((item: PortfolioItem) => (
                <div key={item.id} className="glass-effect rounded-lg overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                          className="glass-effect"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                          disabled={deletePortfolioItemMutation.isPending}
                          className="glass-effect text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Активна" : "Скрыта"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loyalty Program Editor
  if (section === "loyalty") {
    return (
      <div className="space-y-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Управление программой лояльности</CardTitle>
          </CardHeader>
          <CardContent>
            {editingItem && (
              <Form {...loyaltyForm}>
                <form
                  onSubmit={loyaltyForm.handleSubmit((data) =>
                    updateLoyaltyLevelMutation.mutate({ ...data, id: editingItem.id })
                  )}
                  className="space-y-4 mb-8 p-6 glass-effect rounded-lg"
                >
                  <h3 className="text-lg font-semibold">
                    Редактирование уровня "{editingItem.title}"
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={loyaltyForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loyaltyForm.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Скидка (%)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              max="100"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={loyaltyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={loyaltyForm.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Минимальная сумма (₽)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loyaltyForm.control}
                      name="maxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Максимальная сумма (₽)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Оставьте пустым для безлимита"
                              className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={loyaltyForm.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Преимущества (JSON массив)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder='["Скидка 5%", "Бесплатная консультация"]'
                            className="glass-effect border-white/20 focus:border-[hsl(252,100%,71%)]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loyaltyForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Активен</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Показывать уровень на сайте
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={updateLoyaltyLevelMutation.isPending}
                      className="bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить изменения
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(null);
                        loyaltyForm.reset();
                      }}
                      className="glass-effect"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {loyaltyLevels?.map((level: LoyaltyProgram) => (
                <div key={level.id} className="glass-effect rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold mb-2">{level.title}</h4>
                    <div className="text-2xl font-bold text-[hsl(252,100%,71%)] mb-2">
                      {level.discount}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {level.minAmount} - {level.maxAmount ? `${level.maxAmount}₽` : 'Безлимит'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={level.isActive ? "default" : "secondary"}>
                      {level.isActive ? "Активен" : "Неактивен"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(level)}
                      className="glass-effect"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
