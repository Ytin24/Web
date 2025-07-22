import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loyaltyLevels = [
  { value: "bronze", label: "Bronze", color: "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-200" },
  { value: "silver", label: "Silver", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/20 dark:text-slate-200" },
  { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-200" },
  { value: "platinum", label: "Platinum", color: "bg-violet-100 text-violet-800 dark:bg-violet-800/20 dark:text-violet-200" },
];

export default function CustomersManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCustomer) => 
      fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ description: "Клиент успешно добавлен" });
      setIsOpen(false);
      form.reset();
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при добавлении клиента" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertCustomer> }) => 
      fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ description: "Клиент успешно обновлен" });
      setIsOpen(false);
      setEditingCustomer(null);
      form.reset();
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при обновлении клиента" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ description: "Клиент успешно удален" });
      setCustomerToDelete(null);
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при удалении клиента" }),
  });

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      loyaltyLevel: "bronze",
      notes: "",
      totalOrders: 0,
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      phone: customer.phone,
      loyaltyLevel: customer.loyaltyLevel,
      notes: customer.notes || "",
      totalOrders: customer.totalOrders,
    });
    setIsOpen(true);
  };

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const getLoyaltyBadge = (level: string) => {
    const loyalty = loyaltyLevels.find(l => l.value === level);
    return loyalty ? { label: loyalty.label, color: loyalty.color } : { label: level, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="space-y-6">
      <Card className="natural-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            Управление клиентами
          </CardTitle>
          <CardDescription>
            Телефонная книга клиентов с уровнями лояльности и заметками
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Поиск по имени или телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingCustomer(null); form.reset(); }}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Добавить клиента
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? "Редактировать клиента" : "Добавить нового клиента"}</DialogTitle>
                  <DialogDescription>
                    Введите данные клиента для добавления в телефонную книгу
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Имя клиента" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон</FormLabel>
                          <FormControl>
                            <Input placeholder="+7 (999) 123-45-67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="loyaltyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Уровень лояльности</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите уровень" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loyaltyLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalOrders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Количество заказов</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Заметки</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Дополнительная информация о клиенте..." 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                        Отмена
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingCustomer ? "Сохранить" : "Создать"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Уровень лояльности</TableHead>
                  <TableHead>Заказов</TableHead>
                  <TableHead>Последний заказ</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Загрузка клиентов...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "Клиенты не найдены" : "Клиенты не добавлены"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer: Customer) => {
                    const loyaltyBadge = getLoyaltyBadge(customer.loyaltyLevel);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={loyaltyBadge.color}>
                            {loyaltyBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>
                          {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('ru-RU') : 'Нет'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(customer)}
                              className="natural-hover"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCustomerToDelete(customer)}
                              className="natural-hover text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить клиента "{customerToDelete?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customerToDelete && deleteMutation.mutate(customerToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}