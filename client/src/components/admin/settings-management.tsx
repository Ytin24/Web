import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Plus, Edit, Trash2, Save, X, Globe, Lock, 
  Clock, Mail, Database, Key, Shield
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingTypes = [
  { value: "text", label: "Текст" },
  { value: "number", label: "Число" },
  { value: "boolean", label: "Да/Нет" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "json", label: "JSON" }
];

const settingCategories = [
  { value: "general", label: "Общие настройки", icon: Globe },
  { value: "security", label: "Безопасность", icon: Shield },
  { value: "email", label: "Email", icon: Mail },
  { value: "database", label: "База данных", icon: Database },
  { value: "api", label: "API", icon: Key },
  { value: "system", label: "Система", icon: Settings }
];

export default function SettingsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    queryFn: () => fetch("/api/settings").then(res => res.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: { key: string; value: string; description?: string }) => 
      apiRequest("POST", "/api/settings", data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsCreateOpen(false);
      toast({ title: "Настройка создана успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при создании настройки", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: { value: string; description?: string } }) => 
      apiRequest("PUT", `/api/settings/${key}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditingSetting(null);
      toast({ title: "Настройка обновлена успешно" });
    },
    onError: () => {
      toast({ title: "Ошибка при обновлении настройки", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/settings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Настройка удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка при удалении настройки", variant: "destructive" });
    }
  });

  const getSettingCategory = (key: string) => {
    if (key.startsWith('email_') || key.includes('smtp')) return 'email';
    if (key.startsWith('security_') || key.includes('auth') || key.includes('token')) return 'security';
    if (key.startsWith('db_') || key.includes('database')) return 'database';
    if (key.startsWith('api_') || key.includes('webhook')) return 'api';
    if (key.startsWith('system_') || key.includes('cache') || key.includes('log')) return 'system';
    return 'general';
  };

  const getSettingType = (value: string) => {
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value))) return 'number';
    if (value.includes('@') && value.includes('.')) return 'email';
    if (value.startsWith('http') || value.startsWith('https')) return 'url';
    try {
      JSON.parse(value);
      return 'json';
    } catch {
      return 'text';
    }
  };

  const formatValue = (value: string, maxLength = 50) => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         setting.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (setting.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || getSettingCategory(setting.key) === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const SettingForm = ({ setting, onSubmit, onCancel }: {
    setting?: Setting | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      key: setting?.key || "",
      value: setting?.value || "",
      description: setting?.description || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="key">Ключ настройки</Label>
          <Input
            id="key"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
            placeholder="site_name"
            required
            disabled={!!setting} // Ключ нельзя изменять после создания
          />
          <p className="text-sm text-muted-foreground mt-1">
            Используйте snake_case (например: site_name, max_upload_size)
          </p>
        </div>

        <div>
          <Label htmlFor="value">Значение</Label>
          <Textarea
            id="value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Значение настройки"
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Описание назначения настройки"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {setting ? "Обновить" : "Создать"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Загрузка настроек...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Настройки системы
          </h2>
          <p className="text-muted-foreground">
            Управление конфигурацией и настройками приложения
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить настройку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую настройку</DialogTitle>
            </DialogHeader>
            <SettingForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <Input
                id="search"
                placeholder="Поиск по ключу, значению или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="category-filter">Категория</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {settingCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {settingCategories.map(category => {
          const count = settings.filter(s => getSettingCategory(s.key) === category.value).length;
          const Icon = category.icon;
          
          return (
            <Card 
              key={category.value} 
              className={`cursor-pointer transition-colors ${
                filterCategory === category.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setFilterCategory(filterCategory === category.value ? 'all' : category.value)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-muted-foreground">{count} настроек</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Настройки ({filteredSettings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ключ</TableHead>
                  <TableHead>Значение</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Обновлено</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettings.map((setting) => {
                  const category = settingCategories.find(c => c.value === getSettingCategory(setting.key));
                  const type = getSettingType(setting.value);
                  
                  return (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {setting.key}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-40">
                          {type === 'boolean' ? (
                            <Badge variant={setting.value === 'true' ? 'default' : 'secondary'}>
                              {setting.value === 'true' ? 'Да' : 'Нет'}
                            </Badge>
                          ) : type === 'json' ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {formatValue(setting.value, 30)}
                            </code>
                          ) : (
                            <span className="text-sm">{formatValue(setting.value)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {settingTypes.find(t => t.value === type)?.label || type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category && (
                          <div className="flex items-center gap-1">
                            <category.icon className="w-3 h-3" />
                            <span className="text-xs">{category.label}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-60">
                          {setting.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {new Date(setting.updatedAt).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSetting(setting)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Редактировать настройку</DialogTitle>
                              </DialogHeader>
                              <SettingForm
                                setting={setting}
                                onSubmit={(data) => updateMutation.mutate({ 
                                  key: setting.key, 
                                  data: { value: data.value, description: data.description }
                                })}
                                onCancel={() => setEditingSetting(null)}
                              />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить настройку</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить настройку "{setting.key}"? 
                                  Это действие нельзя отменить и может повлиять на работу системы.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMutation.mutate(setting.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredSettings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Настройки не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}