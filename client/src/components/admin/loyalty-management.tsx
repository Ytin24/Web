import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, Star, Trophy, Medal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoyaltyProgram, InsertLoyaltyProgram } from "@shared/schema";

export default function LoyaltyProgramManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loyaltyPrograms, isLoading } = useQuery<LoyaltyProgram[]>({
    queryKey: ["/api/loyalty-program"],
    queryFn: () => fetch("/api/loyalty-program").then(res => res.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertLoyaltyProgram) => 
      apiRequest("POST", "/api/loyalty-program", data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-program"] });
      setIsCreateOpen(false);
      toast({ title: "Уровень лояльности создан" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LoyaltyProgram> }) => 
      apiRequest("PATCH", `/api/loyalty-program/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-program"] });
      setEditingProgram(null);
      toast({ title: "Уровень лояльности обновлен" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/loyalty-program/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-program"] });
      toast({ title: "Уровень лояльности удален" });
    }
  });

  const levels = ["beginner", "silver", "gold", "platinum"];
  const levelLabels = {
    beginner: "Новичок",
    silver: "Серебро",
    gold: "Золото", 
    platinum: "Платина"
  };

  const levelIcons = {
    beginner: Star,
    silver: Medal,
    gold: Trophy,
    platinum: Trophy
  };

  const LoyaltyForm = ({ program, onSubmit, onCancel }: {
    program?: LoyaltyProgram | null;
    onSubmit: (data: InsertLoyaltyProgram) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      level: program?.level || "",
      title: program?.title || "",
      description: program?.description || "",
      benefits: program?.benefits || "",
      minAmount: program?.minAmount || 0,
      discount: program?.discount || 5
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="level">Уровень</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите уровень" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {levelLabels[level as keyof typeof levelLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Название</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Название уровня"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Описание уровня лояльности"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="benefits">Преимущества</Label>
          <Textarea
            id="benefits"
            value={formData.benefits}
            onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
            placeholder="Список преимуществ (каждый с новой строки)"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="minAmount">Минимальная сумма покупок</Label>
          <Input
            id="minAmount"
            type="number"
            value={formData.minAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minAmount: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
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
          <h2 className="text-2xl font-bold">Программа лояльности</h2>
          <p className="text-muted-foreground">Управление уровнями и преимуществами</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Новый уровень
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Создать новый уровень</DialogTitle>
            </DialogHeader>
            <LoyaltyForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {loyaltyPrograms?.map((program) => {
            const Icon = levelIcons[program.level as keyof typeof levelIcons] || Star;
            return (
              <Card key={program.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400/20 to-transparent">
                  <Icon className="absolute top-2 right-2 w-6 h-6 text-yellow-600" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {program.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Уровень:</div>
                      <div className="text-lg font-semibold text-primary">
                        {levelLabels[program.level as keyof typeof levelLabels]}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Описание:</div>
                      <div className="text-muted-foreground">{program.description}</div>
                    </div>
                    
                    {program.benefits && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Преимущества:</div>
                        <div className="text-muted-foreground text-sm">
                          {program.benefits.split('\n').map((benefit, index) => (
                            <div key={index}>• {benefit}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Минимальная сумма:</div>
                      <div className="text-lg font-semibold text-secondary">
                        {program.minAmount.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProgram(program)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(program.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProgram} onOpenChange={(open) => !open && setEditingProgram(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать уровень лояльности</DialogTitle>
          </DialogHeader>
          {editingProgram && (
            <LoyaltyForm
              program={editingProgram}
              onSubmit={(data) => updateMutation.mutate({ id: editingProgram.id, data })}
              onCancel={() => setEditingProgram(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}