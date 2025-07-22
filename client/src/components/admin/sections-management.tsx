import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Edit, Home, User, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Section } from "@shared/schema";

export default function SectionsManagement() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
    queryFn: () => fetch("/api/sections").then(res => res.json())
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Section> }) => 
      fetch(`/api/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      setEditingSection(null);
      toast({ title: "Секция обновлена успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при обновлении секции", variant: "destructive" });
    }
  });

  const SectionEditor = ({ section }: { section: Section }) => {
    const [formData, setFormData] = useState({
      title: section.title,
      subtitle: section.subtitle || "",
      content: section.content || "",
      buttonText: section.buttonText || "",
      imageUrl: section.imageUrl || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateMutation.mutate({ id: section.id, data: formData });
    };

    const sectionIcons = {
      hero: Home,
      about: User,
      loyalty: Star
    };

    const Icon = sectionIcons[section.name as keyof typeof sectionIcons] || Edit;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Секция: {section.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingSection === section.name ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor={`title-${section.name}`}>Заголовок</Label>
                <Input
                  id={`title-${section.name}`}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Заголовок секции"
                />
              </div>

              <div>
                <Label htmlFor={`subtitle-${section.name}`}>Подзаголовок</Label>
                <Input
                  id={`subtitle-${section.name}`}
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Подзаголовок секции"
                />
              </div>

              <div>
                <Label htmlFor={`content-${section.name}`}>Содержание</Label>
                <Textarea
                  id={`content-${section.name}`}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Основное содержание секции"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor={`buttonText-${section.name}`}>Текст кнопки</Label>
                <Input
                  id={`buttonText-${section.name}`}
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="Текст кнопки (если есть)"
                />
              </div>

              <div>
                <Label htmlFor={`imageUrl-${section.name}`}>URL изображения</Label>
                <Input
                  id={`imageUrl-${section.name}`}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="/api/images/hero-flowers-1.svg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSection(null)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Заголовок:</div>
                <div className="text-lg">{section.title}</div>
              </div>
              
              {section.subtitle && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Подзаголовок:</div>
                  <div>{section.subtitle}</div>
                </div>
              )}

              {section.content && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Содержание:</div>
                  <div className="text-gray-600">{section.content}</div>
                </div>
              )}

              {section.buttonText && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Текст кнопки:</div>
                  <div>{section.buttonText}</div>
                </div>
              )}

              {section.imageUrl && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Изображение:</div>
                  <img 
                    src={section.imageUrl} 
                    alt={section.title}
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}

              <Button onClick={() => setEditingSection(section.name)}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Управление секциями</h2>
        <p className="text-gray-600">Редактирование содержимого основных секций сайта</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="space-y-6">
          {sections?.map((section) => (
            <SectionEditor key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}