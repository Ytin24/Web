import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusIcon, PencilIcon, TrashIcon, TrendingUpIcon, DollarSignIcon, ShoppingCartIcon, SettingsIcon, CalculatorIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSaleSchema, insertSettingSchema, createMultiProductSaleSchema, type Sale, type InsertSale, type Setting, type Product, type SaleWithItems } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { value: "cash", label: "Наличные" },
  { value: "card", label: "Карта" },
  { value: "transfer", label: "Перевод" },
  { value: "other", label: "Другое" },
];

const statusOptions = [
  { value: "pending", label: "В ожидании", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Завершена", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Отменена", color: "bg-red-100 text-red-800" },
];

export default function CRMManagement() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMultiProductDialogOpen, setIsMultiProductDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taxRate, setTaxRate] = useState<number>(20);
  const [saleItems, setSaleItems] = useState([{ productName: "", quantity: 1, unitPrice: 0, notes: "" }]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: salesStats } = useQuery<{ totalSales: number, totalRevenue: number, avgOrderValue: number }>({
    queryKey: ["/api/sales/stats"],
  });

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: salesWithItems = [] } = useQuery<SaleWithItems[]>({
    queryKey: ["/api/sales-with-items"],
  });

  // Load tax rate from settings
  useEffect(() => {
    const taxSetting = settings.find(s => s.key === "tax_rate");
    if (taxSetting) {
      setTaxRate(parseFloat(taxSetting.value));
    }
  }, [settings]);

  const createMutation = useMutation({
    mutationFn: (data: InsertSale) =>
      fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/stats"] });
      toast({ description: "Продажа успешно добавлена" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при добавлении продажи" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertSale> }) =>
      fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/stats"] });
      toast({ description: "Продажа успешно обновлена" });
      setIsDialogOpen(false);
      setEditingSale(null);
      form.reset();
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при обновлении продажи" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/sales/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/stats"] });
      toast({ description: "Продажа успешно удалена" });
      setSaleToDelete(null);
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при удалении продажи" }),
  });

  const settingMutation = useMutation({
    mutationFn: (data: { key: string, value: string, description?: string }) =>
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ description: "Настройки успешно сохранены" });
      setIsSettingsOpen(false);
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при сохранении настроек" }),
  });

  const createMultiProductMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/multi-product-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-with-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/stats"] });
      toast({ description: "Многотоварная продажа успешно добавлена" });
      setIsMultiProductDialogOpen(false);
      setSaleItems([{ productName: "", quantity: 1, unitPrice: 0, notes: "" }]);
      multiProductForm.reset();
    },
    onError: () => toast({ variant: "destructive", description: "Ошибка при добавлении продажи" }),
  });

  const multiProductForm = useForm({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      notes: "",
      paymentMethod: "cash",
      status: "completed",
    },
  });

  const form = useForm<InsertSale>({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      productName: "",
      quantity: "1",
      unitPrice: "0",
      subtotal: "0",
      taxAmount: "0",
      totalAmount: "0",
      paymentMethod: "cash",
      status: "completed",
      notes: "",
    },
  });

  const watchedQuantity = form.watch("quantity");
  const watchedUnitPrice = form.watch("unitPrice");

  // Auto-calculate totals when quantity or unit price changes
  useEffect(() => {
    const quantity = parseFloat(watchedQuantity || "0");
    const unitPrice = parseFloat(watchedUnitPrice || "0");
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("taxAmount", taxAmount.toFixed(2));
    form.setValue("totalAmount", totalAmount.toFixed(2));
  }, [watchedQuantity, watchedUnitPrice, taxRate, form]);

  const onSubmit = (data: InsertSale) => {
    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (sale: Sale) => {
    setEditingSale(sale);
    form.reset({
      customerName: sale.customerName || "",
      customerPhone: sale.customerPhone || "",
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount || "0",
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes || "",
      saleDate: sale.saleDate,
    });
    setIsDialogOpen(true);
  };

  const filteredSales = sales.filter((sale: Sale) =>
    sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customerPhone?.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? { label: statusOption.label, color: statusOption.color } : { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(Number(amount));
  };

  const saveTaxRate = () => {
    settingMutation.mutate({
      key: "tax_rate",
      value: taxRate.toString(),
      description: "Налоговая ставка в процентах"
    });
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productName: "", quantity: 1, unitPrice: 0, notes: "" }]);
  };

  const removeSaleItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updated = [...saleItems];
    updated[index] = { ...updated[index], [field]: value };
    setSaleItems(updated);
  };

  const calculateMultiProductTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const onSubmitMultiProduct = (formData: any) => {
    const { subtotal, taxAmount, totalAmount } = calculateMultiProductTotals();
    const saleData = {
      ...formData,
      items: saleItems.filter(item => item.productName && item.quantity > 0),
    };
    createMultiProductMutation.mutate(saleData);
  };

  const statsCards = [
    {
      title: "Общий доход",
      value: formatCurrency(salesStats?.totalRevenue || 0),
      icon: DollarSignIcon,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Количество продаж",
      value: salesStats?.totalSales || 0,
      icon: ShoppingCartIcon,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Средний чек",
      value: formatCurrency(salesStats?.avgOrderValue || 0),
      icon: TrendingUpIcon,
      color: "from-purple-500 to-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Микро CRM</h2>
          <p className="text-muted-foreground">Учет продаж и управление налогами</p>
        </div>
        <Button onClick={() => setIsSettingsOpen(true)} variant="outline">
          <SettingsIcon className="w-4 h-4 mr-2" />
          Настройки
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="natural-card">
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="multi-sales">Мультитоварные</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="natural-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription>{stat.title}</CardDescription>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="natural-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-primary" />
                Управление продажами
              </CardTitle>
              <CardDescription>
                Ведите учет продаж с автоматическим расчетом налогов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <Input
                  placeholder="Поиск по товару, клиенту или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingSale(null); form.reset(); }}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Добавить продажу
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingSale ? "Редактировать продажу" : "Добавить новую продажу"}</DialogTitle>
                      <DialogDescription>
                        Введите данные о продаже. Налог будет рассчитан автоматически.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Имя клиента</FormLabel>
                                <FormControl>
                                  <Input placeholder="Имя клиента" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Телефон клиента</FormLabel>
                                <FormControl>
                                  <Input placeholder="+7 (999) 123-45-67" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Наименование товара/услуги</FormLabel>
                              <FormControl>
                                <Input placeholder="Букет роз, оформление свадьбы..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Количество</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0" 
                                    placeholder="1" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Цена за единицу</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0" 
                                    placeholder="0" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <CalculatorIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Расчет суммы</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Сумма без налога:</span>
                              <div className="font-medium">{formatCurrency(form.watch("subtotal") || 0)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Налог ({taxRate}%):</span>
                              <div className="font-medium">{formatCurrency(form.watch("taxAmount") || 0)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Итого:</span>
                              <div className="font-bold text-lg">{formatCurrency(form.watch("totalAmount") || 0)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Способ оплаты</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Выберите способ оплаты" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method.value} value={method.value}>
                                        {method.label}
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
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Статус</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Выберите статус" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {statusOptions.map((status) => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Заметки</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Дополнительная информация о продаже..." 
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {editingSale ? "Сохранить" : "Создать"}
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
                      <TableHead>Дата</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Товар/Услуга</TableHead>
                      <TableHead>Кол-во</TableHead>
                      <TableHead>Цена за ед.</TableHead>
                      <TableHead>Сумма с налогом</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Загрузка продаж...
                        </TableCell>
                      </TableRow>
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "Продажи не найдены" : "Продажи не добавлены"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale: Sale) => {
                        const statusBadge = getStatusBadge(sale.status);
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('ru-RU') : '-'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{sale.customerName || 'Без имени'}</div>
                                {sale.customerPhone && (
                                  <div className="text-sm text-muted-foreground">{sale.customerPhone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{sale.productName}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(sale.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge className={statusBadge.color}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(sale)}
                                  className="natural-hover"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSaleToDelete(sale)}
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
        </TabsContent>

        <TabsContent value="multi-sales">
          <Card className="natural-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-primary" />
                Многотоварные продажи
              </CardTitle>
              <CardDescription>
                Добавление продаж с несколькими товарами в одном чеке
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Список многотоварных продаж</h3>
                <Dialog open={isMultiProductDialogOpen} onOpenChange={setIsMultiProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Новая многотоварная продажа
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Добавить многотоварную продажу</DialogTitle>
                      <DialogDescription>
                        Создайте продажу с несколькими товарами. Добавьте товары в список, и итоги будут рассчитаны автоматически.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...multiProductForm}>
                      <form onSubmit={multiProductForm.handleSubmit(onSubmitMultiProduct)} className="space-y-6">
                        {/* Customer Information */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="customerName">Имя клиента</Label>
                            <Input
                              id="customerName"
                              placeholder="Имя клиента"
                              {...multiProductForm.register("customerName")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerPhone">Телефон</Label>
                            <Input
                              id="customerPhone"
                              placeholder="+7 (999) 123-45-67"
                              {...multiProductForm.register("customerPhone")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerEmail">Email</Label>
                            <Input
                              id="customerEmail"
                              placeholder="email@example.com"
                              {...multiProductForm.register("customerEmail")}
                            />
                          </div>
                        </div>

                        {/* Sale Items */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Товары в продаже</h4>
                            <Button type="button" onClick={addSaleItem} variant="outline" size="sm">
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Добавить товар
                            </Button>
                          </div>

                          {saleItems.map((item, index) => (
                            <Card key={index} className="p-4">
                              <div className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-4">
                                  <Label>Наименование товара</Label>
                                  <Select
                                    value={item.productName}
                                    onValueChange={(value) => {
                                      updateSaleItem(index, "productName", value);
                                      // Auto-fill price if product exists
                                      const product = products.find(p => p.name === value);
                                      if (product) {
                                        updateSaleItem(index, "unitPrice", parseFloat(product.basePrice));
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Выберите товар" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products.map((product) => (
                                        <SelectItem key={product.id} value={product.name}>
                                          {product.name} - {formatCurrency(product.basePrice)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2">
                                  <Label>Количество</Label>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) => updateSaleItem(index, "quantity", parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Цена за ед.</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateSaleItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Сумма</Label>
                                  <Input
                                    value={formatCurrency(item.quantity * item.unitPrice)}
                                    disabled
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeSaleItem(index)}
                                    disabled={saleItems.length === 1}
                                    className="w-full"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Label>Примечания к товару</Label>
                                <Input
                                  placeholder="Дополнительная информация..."
                                  value={item.notes}
                                  onChange={(e) => updateSaleItem(index, "notes", e.target.value)}
                                />
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <CalculatorIcon className="w-4 h-4" />
                            Итоговые суммы
                          </h4>
                          {(() => {
                            const { subtotal, taxAmount, totalAmount } = calculateMultiProductTotals();
                            return (
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm">Подытог</Label>
                                  <div className="font-medium">{formatCurrency(subtotal)}</div>
                                </div>
                                <div>
                                  <Label className="text-sm">НДС ({taxRate}%)</Label>
                                  <div className="font-medium">{formatCurrency(taxAmount)}</div>
                                </div>
                                <div>
                                  <Label className="text-sm">К доплате</Label>
                                  <div className="font-bold text-lg">{formatCurrency(totalAmount)}</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Payment and Notes */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="paymentMethod">Способ оплаты</Label>
                            <Select {...multiProductForm.register("paymentMethod")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="status">Статус</Label>
                            <Select {...multiProductForm.register("status")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Примечания к продаже</Label>
                          <Textarea
                            id="notes"
                            placeholder="Дополнительная информация о продаже..."
                            {...multiProductForm.register("notes")}
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsMultiProductDialogOpen(false)}
                          >
                            Отмена
                          </Button>
                          <Button
                            type="submit"
                            disabled={createMultiProductMutation.isPending || saleItems.every(item => !item.productName)}
                          >
                            {createMultiProductMutation.isPending ? "Создание..." : "Создать продажу"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Multi-product sales list */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Количество товаров</TableHead>
                      <TableHead>Общая сумма</TableHead>
                      <TableHead>Способ оплаты</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Загрузка продаж...
                        </TableCell>
                      </TableRow>
                    ) : salesWithItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Пока нет многотоварных продаж
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesWithItems.map((sale) => {
                        const statusBadge = getStatusBadge(sale.status);
                        const paymentMethodLabel = paymentMethods.find(p => p.value === sale.paymentMethod)?.label || sale.paymentMethod;
                        
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{new Date(sale.saleDate || '').toLocaleDateString('ru-RU')}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{sale.customerName || "Без имени"}</div>
                                <div className="text-sm text-muted-foreground">{sale.customerPhone || "Без телефона"}</div>
                              </div>
                            </TableCell>
                            <TableCell>{sale.items.length} товар(ов)</TableCell>
                            <TableCell className="font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                            <TableCell>{paymentMethodLabel}</TableCell>
                            <TableCell>
                              <Badge className={statusBadge.color}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement view sale details
                                    toast({ description: "Просмотр деталей будет добавлен позже" });
                                  }}
                                  className="natural-hover"
                                >
                                  Подробно
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSaleToDelete(sale)}
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
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки CRM</DialogTitle>
            <DialogDescription>
              Настройте налоговую ставку для автоматического расчета
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taxRate">Налоговая ставка (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="20"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Налог будет автоматически рассчитываться для всех новых продаж
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveTaxRate} disabled={settingMutation.isPending}>
              Сохранить настройки
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить продажу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить продажу "{saleToDelete?.productName}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => saleToDelete && deleteMutation.mutate(saleToDelete.id)}
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