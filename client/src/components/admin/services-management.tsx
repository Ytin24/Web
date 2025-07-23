import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services', {
        credentials: 'include',
      });
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
  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const processedData = {
        ...data,
        features: data.features ? JSON.stringify(data.features.split('\n').filter(f => f.trim())) : null,
        imageUrl: data.imageUrl || null
      };

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(processedData),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Успех",
        description: "Услуга успешно создана",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormData & { id: number }) => {
      const processedData = {
        ...data,
        features: data.features ? JSON.stringify(data.features.split('\n').filter(f => f.trim())) : null,
        imageUrl: data.imageUrl || null
      };

      const response = await fetch(`/api/services/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(processedData),
      });
      if (!response.ok) throw new Error('Failed to update service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Успех",
        description: "Услуга успешно обновлена",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Успех",
        description: "Услуга успешно удалена",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
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
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
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
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateMutation.mutate({ ...data, id: editingService.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bouquets': return <Flower className="h-4 w-4" />;
      case 'decoration': return <Crown className="h-4 w-4" />;
      case 'events': return <Crown className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'consultation': return <MessageCircle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <Flower className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-border/50">
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
            onClick={handleAdd}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить услугу
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-4">
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
                    {service.price && <span>Цена: {service.price}</span>}
                    {service.duration && <span>Время: {service.duration}</span>}
                    <span>Категория: {categories.find(c => c.value === service.category)?.label}</span>
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
                    onClick={() => deleteMutation.mutate(service.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Service Form Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Редактировать услугу" : "Новая услуга"}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? "Внесите изменения в информацию об услуге" 
                  : "Заполните информацию о новой услуге"
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Название услуги"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Краткое описание</Label>
                <Input
                  id="shortDescription"
                  {...form.register('shortDescription')}
                  placeholder="Краткое описание услуги"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Полное описание</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Подробное описание услуги"
                  rows={3}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена</Label>
                  <Input
                    id="price"
                    {...form.register('price')}
                    placeholder="от 1500₽"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Длительность</Label>
                  <Input
                    id="duration"
                    {...form.register('duration')}
                    placeholder="1 час"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Особенности (каждая с новой строки)</Label>
                <Textarea
                  id="features"
                  {...form.register('features')}
                  placeholder="Индивидуальный подход&#10;Опыт 10+ лет&#10;Практические советы"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL изображения</Label>
                <Input
                  id="imageUrl"
                  {...form.register('imageUrl')}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Активна</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    checked={form.watch('isPopular')}
                    onCheckedChange={(checked) => form.setValue('isPopular', checked)}
                  />
                  <Label htmlFor="isPopular">Популярная</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Порядок сортировки</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...form.register('sortOrder', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingService(null);
                    form.reset();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отменить
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingService ? "Обновить" : "Создать"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}