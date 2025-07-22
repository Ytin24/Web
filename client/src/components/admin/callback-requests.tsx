import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Clock, User, MessageSquare, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import type { CallbackRequest } from "@shared/schema";

export default function CallbackRequests() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: callbackRequests, isLoading } = useQuery<CallbackRequest[]>({
    queryKey: ["/api/callback-requests"]
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/callback-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/callback-requests"] });
      toast({ title: "Статус обновлен", description: "Статус заявки успешно изменен" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить статус", variant: "destructive" });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/callback-requests/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/callback-requests"] });
      toast({ title: "Заявка удалена", description: "Заявка успешно удалена" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    },
  });

  const filteredRequests = callbackRequests?.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Ожидает</Badge>;
      case 'contacted':
        return <Badge variant="default">Связались</Badge>;
      case 'completed':
        return <Badge variant="secondary">Завершено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-red-600" />;
      case 'contacted':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo > 24) return "text-red-600";
    if (hoursAgo > 4) return "text-yellow-600";
    return "text-green-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-3">Загрузка заявок...</span>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = callbackRequests?.filter(r => r.status === 'pending').length || 0;
  const contactedCount = callbackRequests?.filter(r => r.status === 'contacted').length || 0;
  const completedCount = callbackRequests?.filter(r => r.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(252,100%,71%)]">{callbackRequests?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Связались</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{contactedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Завершены</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="glass-effect">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Заявки на обратный звонок</CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 glass-effect border-white/20">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все заявки</SelectItem>
                <SelectItem value="pending">Ожидают</SelectItem>
                <SelectItem value="contacted">Связались</SelectItem>
                <SelectItem value="completed">Завершены</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Заявки не найдены</p>
              <p className="text-sm">
                {filterStatus === "all" 
                  ? "Новых заявок пока нет" 
                  : `Нет заявок со статусом "${filterStatus}"`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="glass-effect rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold text-lg flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {request.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {request.phone}
                            </span>
                            <span className={`flex items-center ${getPriorityColor(request.createdAt!.toString())}`}>
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(request.createdAt!).toLocaleString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <MessageSquare className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                            <p className="text-gray-700">{request.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Call Time Preference */}
                      {request.callTime && (
                        <div className="text-sm text-gray-600">
                          <strong>Удобное время для звонка:</strong> {request.callTime}
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Статус:</span>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 min-w-[200px]">
                      <Select
                        value={request.status}
                        onValueChange={(newStatus) => 
                          updateStatusMutation.mutate({ id: request.id, status: newStatus })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="glass-effect border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="contacted">Связались</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${request.phone}`, '_self')}
                          className="glass-effect flex-1"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Позвонить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRequestMutation.mutate(request.id)}
                          disabled={deleteRequestMutation.isPending}
                          className="glass-effect text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Quick Actions for Pending Requests */}
                      {request.status === 'pending' && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                updateStatusMutation.mutate({ id: request.id, status: 'contacted' })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="glass-effect text-blue-600 hover:text-blue-700 flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Связались
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions for Contacted Requests */}
                      {request.status === 'contacted' && (
                        <div className="pt-2 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => 
                              updateStatusMutation.mutate({ id: request.id, status: 'completed' })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="glass-effect text-green-600 hover:text-green-700 w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Завершить
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urgent Alerts */}
      {pendingCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h4 className="font-semibold text-red-800">
                  Внимание! {pendingCount} заявок ожидают ответа
                </h4>
                <p className="text-sm text-red-600">
                  Рекомендуется обработать заявки в течение 15 минут для лучшего клиентского сервиса
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
