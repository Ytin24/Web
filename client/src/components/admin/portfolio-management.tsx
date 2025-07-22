import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, Edit, Trash2, Save, X, Eye, EyeOff, Search,
  Image as ImageIcon, FileImage, Grid
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PortfolioItem, InsertPortfolioItem } from "@shared/schema";

export default function PortfolioManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: portfolioItems, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-items"],
    queryFn: () => fetch("/api/portfolio-items").then(res => res.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPortfolioItem) => fetch("/api/portfolio-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      setIsCreateOpen(false);
      toast({ title: "Работа добавлена успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при добавлении работы", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PortfolioItem> }) => 
      fetch(`/api/portfolio-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      setEditingItem(null);
      toast({ title: "Работа обновлена успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при обновлении работы", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/portfolio-items/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      toast({ title: "Работа удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка при удалении работы", variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/portfolio-items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-items"] });
      toast({ title: "Статус видимости изменен" });
    }
  });

  const categories = ["wedding", "corporate", "birthday", "seasonal"];
  const categoryLabels = {
    wedding: "Свадебные",
    corporate: "Корпоративные", 
    birthday: "Праздничные",
    seasonal: "Сезонные"
  };

  const filteredItems = portfolioItems?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && item.isActive) ||
                         (filterStatus === "hidden" && !item.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const PortfolioForm = ({ item, onSubmit, onCancel }: {
    item?: PortfolioItem | null;
    onSubmit: (data: InsertPortfolioItem) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: item?.title || "",
      description: item?.description || "",
      category: item?.category || "",
      imageUrl: item?.imageUrl || "",
      isActive: item?.isActive || true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Название работы</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Введите название работы"
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
                <SelectItem key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Описание работы"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="imageUrl">URL изображения</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="/api/images/portfolio-wedding-1.svg"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isActive">Показывать на сайте</Label>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление портфолио</h2>
          <p className="text-gray-600">Добавление и редактирование работ</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить работу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Добавить новую работу</DialogTitle>
            </DialogHeader>
            <PortfolioForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
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
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Поиск по названию..."
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
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </SelectItem>
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
                  <SelectItem value="all">Все работы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="hidden">Скрытые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Items Grid */}
      {isLoading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Grid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Работы не найдены</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={item.imageUrl || '/api/images/portfolio-wedding-1.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Активно" : "Скрыто"}
                  </Badge>
                  <Badge variant="outline">
                    {categoryLabels[item.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({
                        id: item.id,
                        isActive: !item.isActive
                      })}
                    >
                      {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать работу</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <PortfolioForm
              item={editingItem}
              onSubmit={(data) => updateMutation.mutate({ id: editingItem.id, data })}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}