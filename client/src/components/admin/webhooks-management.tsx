import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, Send, Eye, BarChart3, Webhook, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface WebhookEvent {
  event: string;
  description: string;
}

interface WebhookStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastDelivery?: string;
  successRate: number;
}

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  createdAt: string;
  stats: WebhookStats;
}

interface WebhookDelivery {
  id: number;
  eventType: string;
  successful: boolean;
  responseStatus?: number;
  createdAt: string;
  attemptCount: number;
}

const webhookSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  url: z.string().url("Некорректный URL"),
  events: z.array(z.string()).min(1, "Выберите хотя бы одно событие"),
  secret: z.string().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

export default function WebhooksManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch webhook events
  const { data: events = [] } = useQuery<WebhookEvent[]>({
    queryKey: ['/api/webhooks/events'],
  });

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery<Webhook[]>({
    queryKey: ['/api/webhooks'],
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: (data: WebhookFormData) => 
      fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      setIsCreateOpen(false);
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/webhooks/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/webhooks/${id}/test`, { method: 'POST' }).then(res => res.json()),
  });

  // Toggle webhook mutation
  const toggleWebhookMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      fetch(`/api/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
    },
  });

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
      secret: "",
    },
  });

  const onSubmit = (data: WebhookFormData) => {
    createWebhookMutation.mutate(data);
  };

  const handleViewDetails = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`);
      const detailedWebhook = await response.json();
      setSelectedWebhook(detailedWebhook);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching webhook details:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold gradient-text">Webhook Уведомления</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Загрузка webhook'ов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Webhook Уведомления</h2>
          <p className="text-muted-foreground">
            Настройте автоматические уведомления о событиях на сайте
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать Webhook</DialogTitle>
              <DialogDescription>
                Настройте URL для получения уведомлений о событиях на сайте
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input placeholder="Мой webhook" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL для уведомлений</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yoursite.com/webhook" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="events"
                  render={() => (
                    <FormItem>
                      <FormLabel>События для отслеживания</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {events.map((event) => (
                          <FormField
                            key={event.event}
                            control={form.control}
                            name="events"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(event.event)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      if (checked) {
                                        field.onChange([...value, event.event]);
                                      } else {
                                        field.onChange(value.filter(v => v !== event.event));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel className="text-sm font-normal">
                                    {event.description}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {event.event}
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Секретный ключ (опционально)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Для проверки подлинности webhook'а" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={createWebhookMutation.isPending}>
                    {createWebhookMutation.isPending ? "Создание..." : "Создать"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Webhook'и не настроены</h3>
            <p className="text-muted-foreground mb-4">
              Создайте первый webhook для получения уведомлений о событиях на сайте
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="natural-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {webhook.name}
                      <Badge variant={webhook.isActive ? "default" : "secondary"}>
                        {webhook.isActive ? "Активен" : "Отключен"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {webhook.url}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(webhook)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testWebhookMutation.mutate(webhook.id)}
                      disabled={testWebhookMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleWebhookMutation.mutate({
                        id: webhook.id,
                        isActive: !webhook.isActive
                      })}
                    >
                      {webhook.isActive ? "Отключить" : "Включить"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{webhook.stats.successfulDeliveries} успешных</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>{webhook.stats.failedDeliveries} ошибок</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span>{webhook.stats.successRate.toFixed(1)}% успех</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {webhook.events.length} событий отслеживается
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Webhook Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedWebhook && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWebhook.name}</DialogTitle>
                <DialogDescription>
                  Детальная информация о webhook'е и последние доставки
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Webhook Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>URL</Label>
                    <p className="font-mono text-sm bg-muted p-2 rounded">
                      {selectedWebhook.url}
                    </p>
                  </div>
                  <div>
                    <Label>Статус</Label>
                    <div className="mt-1">
                      <Badge variant={selectedWebhook.isActive ? "default" : "secondary"}>
                        {selectedWebhook.isActive ? "Активен" : "Отключен"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Events */}
                <div>
                  <Label>Отслеживаемые события</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedWebhook.events.map((event) => (
                      <Badge key={event} variant="outline">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedWebhook.stats.successfulDeliveries}
                    </div>
                    <div className="text-sm text-muted-foreground">Успешных</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedWebhook.stats.failedDeliveries}
                    </div>
                    <div className="text-sm text-muted-foreground">Ошибок</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedWebhook.stats.totalDeliveries}
                    </div>
                    <div className="text-sm text-muted-foreground">Всего</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedWebhook.stats.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Успех</div>
                  </Card>
                </div>

                {/* Recent Deliveries */}
                {(selectedWebhook as any).recentDeliveries && (
                  <div>
                    <Label>Последние доставки</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedWebhook as any).recentDeliveries.map((delivery: WebhookDelivery) => (
                        <div key={delivery.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-3">
                            {delivery.successful ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-mono text-sm">{delivery.eventType}</p>
                              {delivery.responseStatus && (
                                <p className="text-xs text-muted-foreground">
                                  HTTP {delivery.responseStatus}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(delivery.createdAt), { 
                                addSuffix: true, 
                                locale: ru 
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Попытка {delivery.attemptCount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}