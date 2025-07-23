import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, Plus, Edit, Trash2, Save, X, Star, Eye, EyeOff,
  Flower, Crown, Truck, Clock, MessageCircle 
} from "lucide-react";
import type { Service } from "@shared/schema";

// Form validation schema
const serviceFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  shortDescription: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
  category: z.string().min(1, "Категория обязательна"),
  features: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  sortOrder: z.number().min(0)
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const categories = [
  { value: "bouquets", label: "Букеты" },
  { value: "decoration", label: "Оформление" },
  { value: "events", label: "Мероприятия" },
  { value: "delivery", label: "Доставка" },
  { value: "consultation", label: "Консультации" },
  { value: "maintenance", label: "Уход за растениями" }
];

export function ServicesManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });

  // Form setup
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      duration: "",
      category: "bouquets",
      features: "",
      imageUrl: "",
      isActive: true,
      isPopular: false,
      sortOrder: 0
    }
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const payload = {
        ...data,
        features: data.features ? JSON.stringify(data.features.split('\n').filter(f => f.trim())) : "[]"
      };

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Услуга создана",
        description: "Новая услуга успешно добавлена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsFormOpen(false);
      form.reset({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        duration: "",
        category: "bouquets",
        features: "",
        imageUrl: "",
        isActive: true,
        isPopular: false,
        sortOrder: 0
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать услугу",
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ServiceFormData }) => {
      const payload = {
        ...data,
        features: data.features ? JSON.stringify(data.features.split('\n').filter(f => f.trim())) : "[]"
      };

      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update service');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Услуга обновлена",
        description: "Изменения успешно сохранены",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsFormOpen(false);
      setEditingService(null);
      form.reset({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        duration: "",
        category: "bouquets",
        features: "",
        imageUrl: "",
        isActive: true,
        isPopular: false,
        sortOrder: 0
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить услугу",
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Услуга удалена",
        description: "Услуга успешно удалена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить услугу",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const features = service.features ? JSON.parse(service.features).join('\n') : '';
    
    form.reset({
      name: service.name,
      description: service.description,
      shortDescription: service.shortDescription || "",
      price: service.price || "",
      duration: service.duration || "",
      category: service.category || "bouquets",
      features,
      imageUrl: service.imageUrl || "",
      isActive: service.isActive ?? true,
      isPopular: service.isPopular ?? false,
      sortOrder: service.sortOrder ?? 0
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bouquets': return <Flower className="h-4 w-4" />;
      case 'decoration': return <Crown className="h-4 w-4" />;
      case 'events': return <Star className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'consultation': return <MessageCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Управление услугами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Управление услугами
        </CardTitle>
        <CardDescription>
          Добавляйте и редактируйте услуги компании
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            Всего услуг: {services.length}
          </div>
          <Button
            onClick={() => {
              setEditingService(null);
              form.reset();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить услугу
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-4 mb-6">
          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(service.category)}
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.isPopular && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Популярная
                      </Badge>
                    )}
                    {!service.isActive && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <EyeOff className="h-3 w-3" />
                        Скрыта
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {service.shortDescription || service.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getCategoryLabel(service.category)}</span>
                    {service.price && <span>Цена: {service.price}</span>}
                    {service.duration && <span>Время: {service.duration}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    disabled={deleteServiceMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Service Form */}
        {isFormOpen && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {editingService ? "Редактировать услугу" : "Новая услуга"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название услуги *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      className="glass-effect"
                      placeholder="Букеты на заказ"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select 
                      value={form.watch("category") || "bouquets"} 
                      onValueChange={(value) => form.setValue("category", value)}
                    >
                      <SelectTrigger className="glass-effect">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Краткое описание</Label>
                  <Input
                    id="shortDescription"
                    {...form.register("shortDescription")}
                    className="glass-effect"
                    placeholder="Создаем уникальные букеты для особых моментов"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Полное описание *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...form.register("description")}
                    className="glass-effect"
                    placeholder="Подробное описание услуги..."
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена</Label>
                    <Input
                      id="price"
                      {...form.register("price")}
                      className="glass-effect"
                      placeholder="от 2000₽"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Длительность</Label>
                    <Input
                      id="duration"
                      {...form.register("duration")}
                      className="glass-effect"
                      placeholder="2-3 часа"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Порядок сортировки</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      {...form.register("sortOrder", { valueAsNumber: true })}
                      className="glass-effect"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Особенности (каждая с новой строки)</Label>
                  <Textarea
                    id="features"
                    rows={3}
                    {...form.register("features")}
                    className="glass-effect"
                    placeholder={`Индивидуальный подход\nСвежие цветы\nБыстрая доставка`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    {...form.register("imageUrl")}
                    className="glass-effect"
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) => form.setValue("isActive", checked)}
                    />
                    <Label htmlFor="isActive">Активна</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPopular"
                      checked={form.watch("isPopular")}
                      onCheckedChange={(checked) => form.setValue("isPopular", checked)}
                    />
                    <Label htmlFor="isPopular">Популярная</Label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createServiceMutation.isPending || updateServiceMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingService(null);
                      form.reset({
                        name: "",
                        description: "",
                        shortDescription: "",
                        price: "",
                        duration: "",
                        category: "bouquets",
                        features: "",
                        imageUrl: "",
                        isActive: true,
                        isPopular: false,
                        sortOrder: 0
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                    Отменить
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}