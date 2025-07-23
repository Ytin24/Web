import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Save, X, Eye, EyeOff } from "lucide-react";
import type { Section } from "@shared/schema";

interface SectionFormData {
  name: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
}

export default function SectionsManagement() {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<SectionFormData>({
    name: "",
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    isActive: true
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Получение всех секций
  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  // Мутация для создания секции
  const createMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка создания секции");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({
        title: "Успех",
        description: "Секция создана успешно",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для обновления секции
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<SectionFormData> }) => {
      const response = await fetch(`/api/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка обновления секции");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({
        title: "Успех",
        description: "Секция обновлена успешно",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      content: "",
      imageUrl: "",
      isActive: true
    });
    setEditingSection(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSection(null);
    resetForm();
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setIsCreating(false);
    setFormData({
      name: section.name,
      title: section.title,
      description: section.description || "",
      content: section.content || "",
      imageUrl: section.imageUrl || "",
      isActive: section.isActive ?? true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка секций...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Управление секциями</h2>
          <p className="text-muted-foreground">
            Управление содержимым основных секций сайта
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Создать секцию
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingSection) && (
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingSection ? "Редактировать секцию" : "Создать секцию"}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя секции *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="hero, about, contacts"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Заголовок секции"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Краткое описание секции"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Контент (JSON)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="JSON контент для секции"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL изображения</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Активная секция</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSection ? "Обновить" : "Создать"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список секций */}
      <div className="grid gap-4">
        {sections?.map((section) => (
          <Card key={section.id} className="glass-effect border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {section.title}
                    </h3>
                    <Badge
                      variant={section.isActive ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {section.isActive ? (
                        <><Eye className="w-3 h-3" /> Активная</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Неактивная</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Имя:</strong> {section.name}</div>
                    {section.description && (
                      <div><strong>Описание:</strong> {section.description}</div>
                    )}
                    {section.imageUrl && (
                      <div><strong>Изображение:</strong> 
                        <a 
                          href={section.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline ml-1"
                        >
                          Просмотр
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Редактировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections?.length === 0 && (
        <Card className="glass-effect border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Секции не найдены</p>
              <p>Создайте первую секцию для управления содержимым сайта</p>
            </div>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Создать секцию
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { SectionsManagement };