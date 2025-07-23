import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Palette, CheckCircle, Eye, Sparkles } from "lucide-react";
import { applyColorScheme, type ColorSchemeName } from "@shared/color-palette";

interface ColorSchemeData {
  currentScheme: ColorSchemeName;
  schemeData: any;
  availableSchemes: Array<{
    key: ColorSchemeName;
    name: string;
    description: string;
  }>;
}

export function ColorSchemeManagement() {
  const [selectedScheme, setSelectedScheme] = useState<ColorSchemeName | "">("");
  const [previewScheme, setPreviewScheme] = useState<ColorSchemeName | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch current color scheme
  const { data: colorSchemeData, isLoading } = useQuery<ColorSchemeData>({
    queryKey: ['/api/color-scheme'],
  });

  // Update color scheme mutation
  const updateSchemeMutation = useMutation({
    mutationFn: async (schemeName: ColorSchemeName) => {
      const response = await fetch('/api/color-scheme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ schemeName }),
      });
      if (!response.ok) throw new Error('Failed to update color scheme');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Цветовая схема обновлена",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/color-scheme'] });
      // Apply the new color scheme immediately
      applyColorScheme(data.currentScheme);
      setSelectedScheme("");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить цветовую схему",
        variant: "destructive",
      });
    },
  });

  // Preview color scheme
  const handlePreview = (schemeName: ColorSchemeName) => {
    setPreviewScheme(schemeName);
    applyColorScheme(schemeName);
    toast({
      title: "Предпросмотр активирован",
      description: `Просматривается схема "${colorSchemeData?.availableSchemes.find(s => s.key === schemeName)?.name}"`,
    });
  };

  // Cancel preview and restore current scheme
  const cancelPreview = () => {
    if (colorSchemeData?.currentScheme) {
      applyColorScheme(colorSchemeData.currentScheme);
      setPreviewScheme(null);
      toast({
        title: "Предпросмотр отменен",
        description: "Восстановлена текущая цветовая схема",
      });
    }
  };

  // Apply selected scheme
  const handleApplyScheme = () => {
    if (selectedScheme) {
      updateSchemeMutation.mutate(selectedScheme);
      setPreviewScheme(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Цветовые схемы
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
    <div className="space-y-6">
      {/* Current Scheme Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Управление цветовыми схемами
          </CardTitle>
          <CardDescription>
            Настройте внешний вид сайта, выбрав подходящую цветовую палитру
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Active Scheme */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Текущая схема</h3>
                <p className="text-sm text-muted-foreground">
                  {colorSchemeData?.availableSchemes.find(s => s.key === colorSchemeData?.currentScheme)?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {colorSchemeData?.availableSchemes.find(s => s.key === colorSchemeData?.currentScheme)?.description}
                </p>
              </div>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Активна
              </Badge>
            </div>

            {/* Preview Warning */}
            {previewScheme && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Режим предпросмотра активен
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Вы просматриваете схему "{colorSchemeData?.availableSchemes.find(s => s.key === previewScheme)?.name}". 
                      Примените изменения или отмените предпросмотр.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelPreview}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            )}

            {/* Scheme Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Выберите цветовую схему:</label>
              <Select value={selectedScheme} onValueChange={(value) => setSelectedScheme(value as ColorSchemeName)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите схему для применения" />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemeData?.availableSchemes.map((scheme) => (
                    <SelectItem key={scheme.key} value={scheme.key}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scheme.name}</span>
                        {scheme.key === colorSchemeData?.currentScheme && (
                          <Badge variant="secondary" className="text-xs">Текущая</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedScheme && (
                <p className="text-sm text-muted-foreground">
                  {colorSchemeData?.availableSchemes.find(s => s.key === selectedScheme)?.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApplyScheme}
                disabled={!selectedScheme || updateSchemeMutation.isPending || selectedScheme === colorSchemeData?.currentScheme}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {updateSchemeMutation.isPending ? "Применяется..." : "Применить схему"}
              </Button>
              
              {selectedScheme && selectedScheme !== colorSchemeData?.currentScheme && (
                <Button
                  variant="outline"
                  onClick={() => handlePreview(selectedScheme)}
                  disabled={previewScheme === selectedScheme}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Предпросмотр
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Schemes Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Доступные цветовые схемы
          </CardTitle>
          <CardDescription>
            Ознакомьтесь с доступными вариантами оформления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colorSchemeData?.availableSchemes.map((scheme) => (
              <Card 
                key={scheme.key} 
                className={`relative transition-all duration-200 hover:shadow-md ${
                  scheme.key === colorSchemeData?.currentScheme 
                    ? 'ring-2 ring-primary' 
                    : previewScheme === scheme.key 
                    ? 'ring-2 ring-yellow-400' 
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{scheme.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {scheme.description}
                      </CardDescription>
                    </div>
                    {scheme.key === colorSchemeData?.currentScheme && (
                      <Badge variant="default" className="text-xs">
                        Активна
                      </Badge>
                    )}
                    {previewScheme === scheme.key && (
                      <Badge variant="secondary" className="text-xs">
                        Предпросмотр
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-1 mb-3">
                    {/* Color preview swatches - these would be dynamically generated based on scheme */}
                    <div className="w-6 h-6 rounded-full bg-primary border-2 border-background shadow-sm"></div>
                    <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background shadow-sm"></div>
                    <div className="w-6 h-6 rounded-full bg-accent border-2 border-background shadow-sm"></div>
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background shadow-sm"></div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(scheme.key)}
                      disabled={previewScheme === scheme.key}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Предпросмотр
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateSchemeMutation.mutate(scheme.key)}
                      disabled={scheme.key === colorSchemeData?.currentScheme || updateSchemeMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Применить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}