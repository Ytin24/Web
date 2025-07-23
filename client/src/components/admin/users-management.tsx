import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, UserPlus, Edit, Trash2, Save, X, Shield, ShieldCheck, 
  UserX, UserCheck, Unlock, Lock, AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
  isActive: boolean | null;
  failedLoginAttempts: number | null;
  accountLockedUntil: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
}

const roles = [
  { value: "admin", label: "Администратор" },
  { value: "super_admin", label: "Супер Администратор" },
  { value: "editor", label: "Редактор" },
  { value: "viewer", label: "Просмотр" }
];

export default function UsersManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/auth/users"],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch("/api/auth/users", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result.users;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string; role: string }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      setIsCreateOpen(false);
      toast({ title: "Пользователь создан успешно" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка при создании пользователя", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/auth/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      setEditingUser(null);
      toast({ title: "Пользователь обновлен успешно" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка при обновлении пользователя", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/auth/users/${id}/deactivate`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deactivate user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      toast({ title: "Пользователь деактивирован" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка деактивации", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/auth/users/${id}/unlock`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to unlock user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/users"] });
      toast({ title: "Пользователь разблокирован" });
    },
    onError: () => {
      toast({ 
        title: "Ошибка разблокировки", 
        variant: "destructive" 
      });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive) ||
      (filterStatus === "locked" && user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date());
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find(r => r.value === role);
    return (
      <Badge variant={role === 'super_admin' ? 'destructive' : role === 'admin' ? 'default' : 'secondary'}>
        {roleInfo?.label || role}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="outline" className="text-red-600"><UserX className="w-3 h-3 mr-1" />Неактивен</Badge>;
    }
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return <Badge variant="destructive"><Lock className="w-3 h-3 mr-1" />Заблокирован</Badge>;
    }
    return <Badge variant="default" className="text-green-600"><UserCheck className="w-3 h-3 mr-1" />Активен</Badge>;
  };

  const UserForm = ({ user, onSubmit, onCancel }: {
    user?: User | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      username: user?.username || "",
      password: "",
      email: user?.email || "",
      role: user?.role || "admin",
      isActive: user?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = user ? 
        { ...formData, password: formData.password || undefined } :
        formData;
      onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Имя пользователя</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="admin"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">{user ? "Новый пароль (оставьте пустым для сохранения)" : "Пароль"}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required={!user}
          />
        </div>

        <div>
          <Label htmlFor="email">Email (необязательно)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <Label htmlFor="role">Роль</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {user && (
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              disabled={user.id === 1} // Защита root пользователя
            />
            <Label htmlFor="isActive">Активный пользователь</Label>
            {user.id === 1 && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Защищено
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {user ? "Обновить" : "Создать"}
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
          <div className="text-center">Загрузка пользователей...</div>
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
            <Users className="w-6 h-6" />
            Управление пользователями
          </h2>
          <p className="text-muted-foreground">
            Управление учетными записями администраторов и сотрудников
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать нового пользователя</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <Input
                id="search"
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="role-filter">Роль</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="locked">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Пользователи ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead>Неудачные попытки</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.username}
                          {user.id === 1 && <Shield className="w-4 h-4 text-amber-500" title="Root пользователь" />}
                        </div>
                        {user.email && (
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Никогда'}
                    </TableCell>
                    <TableCell>
                      {(user.failedLoginAttempts || 0) > 0 && (
                        <Badge variant="outline" className="text-amber-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {user.failedLoginAttempts}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать пользователя</DialogTitle>
                            </DialogHeader>
                            <UserForm
                              user={user}
                              onSubmit={(data) => updateMutation.mutate({ id: user.id, data })}
                              onCancel={() => setEditingUser(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        {user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unlockMutation.mutate(user.id)}
                          >
                            <Unlock className="w-3 h-3" />
                          </Button>
                        )}

                        {user.id !== 1 && user.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <UserX className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Деактивировать пользователя</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите деактивировать пользователя "{user.username}"? 
                                  Он не сможет войти в систему.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deactivateMutation.mutate(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Деактивировать
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Пользователи не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}