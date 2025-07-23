import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Home, BookOpen, Image, Star, Phone, Plus, Edit, Trash2, 
  Save, X, Eye, EyeOff, Activity, Users, TrendingUp, Clock, Code, Flower, LogOut, Loader2, Package, Palette, MapPin, Settings
} from "lucide-react";
import BlogManagement from "@/components/admin/blog-management";
import PortfolioManagement from "@/components/admin/portfolio-management";
import ProductsManagement from "@/components/admin/products-management";
import CallbackRequests from "@/components/admin/callback-requests";
import LoyaltyProgramManagement from "@/components/admin/loyalty-management";
import TokenManagement from "@/components/admin/token-management";
import ApiDocumentation from "@/components/admin/api-documentation";
import CustomersManagement from "@/components/admin/customers-management";
import CRMManagement from "@/components/admin/crm-management";
import { ColorSchemeManagement } from "@/components/admin/color-scheme-management";
import { ContactManagement } from "@/components/admin/contact-management";
import { ServicesManagement } from "@/components/admin/services-management";
import WebhooksManagement from "@/components/admin/webhooks-management";
import UsersManagement from "@/components/admin/users-management";
import SettingsManagement from "@/components/admin/settings-management";
import SectionsManagement from "@/components/admin/sections-management";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Section, BlogPost, PortfolioItem, CallbackRequest, LoyaltyProgram } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Queries with proper fetcher functions - moved to top to avoid hooks rule violation
  const { data: sections } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
    queryFn: () => fetch("/api/sections").then(res => res.json()),
    enabled: isAuthenticated // Only fetch when authenticated
  });

  const { data: callbackRequests } = useQuery<CallbackRequest[]>({
    queryKey: ["/api/callback-requests"],
    queryFn: () => fetch("/api/callback-requests").then(res => res.json()),
    enabled: isAuthenticated
  });

  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: () => fetch("/api/blog-posts").then(res => res.json()),
    enabled: isAuthenticated
  });

  const { data: portfolioItems } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-items"],
    queryFn: () => fetch("/api/portfolio-items").then(res => res.json()),
    enabled: isAuthenticated
  });

  const { data: loyaltyPrograms } = useQuery<LoyaltyProgram[]>({
    queryKey: ["/api/loyalty-program"],
    queryFn: () => fetch("/api/loyalty-program").then(res => res.json()),
    enabled: isAuthenticated
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLocation('/admin-login');
        return;
      }

      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok && result.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setLocation('/admin-login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setLocation('/admin-login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const sessionToken = localStorage.getItem('admin_session');

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Session-Token': sessionToken || '',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_session');
      setLocation('/admin-login');
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cream-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Component will be unmounted as we redirect
  }

  // Dashboard statistics
  const pendingRequests = callbackRequests?.filter(req => req.status === 'pending').length || 0;
  const publishedBlogs = blogPosts?.filter(post => post.isPublished).length || 0;
  const activePortfolios = portfolioItems?.filter(item => item.isActive).length || 0;
  const totalLoyaltyLevels = loyaltyPrograms?.length || 0;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect border-border/50 bg-gradient-to-br from-destructive/10 to-destructive/20 dark:from-destructive/20 dark:to-destructive/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-destructive-foreground">Новые заявки</CardTitle>
              <Phone className="w-5 h-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{pendingRequests}</div>
            <div className="text-sm text-muted-foreground mt-1">Требуют обработки</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-foreground">Статьи блога</CardTitle>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{publishedBlogs}</div>
            <div className="text-sm text-muted-foreground mt-1">Опубликовано</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50 bg-gradient-to-br from-secondary/10 to-secondary/20 dark:from-secondary/20 dark:to-secondary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary-foreground">Портфолио</CardTitle>
              <Image className="w-5 h-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{activePortfolios}</div>
            <div className="text-sm text-muted-foreground mt-1">Активных работ</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50 bg-gradient-to-br from-accent/10 to-accent/20 dark:from-accent/20 dark:to-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-accent-foreground">Лояльность</CardTitle>
              <Star className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{totalLoyaltyLevels}</div>
            <div className="text-sm text-muted-foreground mt-1">Уровней программы</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5" />
              Последние заявки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callbackRequests?.slice(0, 5).map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                  <div>
                    <div className="font-medium text-foreground">{request.name}</div>
                    <div className="text-sm text-muted-foreground">{request.phone}</div>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'destructive' : 'secondary'}>
                    {request.status === 'pending' ? 'Новая' : 'Обработана'}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-6 text-muted-foreground">
                  Нет заявок
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5" />
              Последние статьи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogPosts?.slice(0, 5).map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/30">
                  <div>
                    <div className="font-medium text-foreground truncate max-w-48">{post.title}</div>
                    <div className="text-sm text-muted-foreground">{post.category}</div>
                  </div>
                  <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                    {post.isPublished ? 'Опубликовано' : 'Черновик'}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-6 text-muted-foreground">
                  Нет статей
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button 
              onClick={() => setActiveTab("blog")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Новая статья</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("portfolio")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <Image className="w-6 h-6" />
              <span className="text-sm">Добавить работу</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("requests")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <Phone className="w-6 h-6" />
              <span className="text-sm">Заявки</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("customers")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Клиенты</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("loyalty")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <Star className="w-6 h-6" />
              <span className="text-sm">Лояльность</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab("products")}
              className="h-20 flex-col gap-2 glass-hover"
              variant="outline"
            >
              <Package className="w-6 h-6" />
              <span className="text-sm">Товары</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Панель управления", icon: Home },
    { id: "blog", label: "Блог", icon: BookOpen },
    { id: "portfolio", label: "Портфолио", icon: Image },
    { id: "requests", label: "Заявки", icon: Phone },
    { id: "customers", label: "Клиенты", icon: Users },
    { id: "crm", label: "CRM", icon: TrendingUp },
    { id: "loyalty", label: "Лояльность", icon: Star },
    { id: "products", label: "Товары", icon: Package },
    { id: "services", label: "Услуги", icon: Settings },
    { id: "sections", label: "Секции", icon: Edit },
    { id: "contacts", label: "Контакты", icon: MapPin },
    { id: "colors", label: "Цвета", icon: Palette },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "settings", label: "Настройки", icon: Settings },
    { id: "tokens", label: "API", icon: Code },
    { id: "webhooks", label: "Webhook'и", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Flower className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Цветокрафт</h1>
                <p className="text-sm text-muted-foreground">Панель управления</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Вошел как: <span className="font-medium text-foreground">{currentUser?.username}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="w-4 h-4 mr-2" />
                На сайт
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выход
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="glass-effect border border-border/50 bg-muted/30 p-2 h-auto flex-wrap justify-start gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground glass-hover"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            <TabsContent value="dashboard" className="mt-0">
              {renderDashboard()}
            </TabsContent>
            
            <TabsContent value="blog" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <BlogManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <PortfolioManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requests" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <CallbackRequests />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="customers" className="mt-0">
              <CustomersManagement />
            </TabsContent>
            
            <TabsContent value="crm" className="mt-0">
              <CRMManagement />
            </TabsContent>
            
            <TabsContent value="loyalty" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <LoyaltyProgramManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <ProductsManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="mt-0">
              <ServicesManagement />
            </TabsContent>
            
            <TabsContent value="sections" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <SectionsManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-0">
              <ContactManagement />
            </TabsContent>
            
            <TabsContent value="colors" className="mt-0">
              <ColorSchemeManagement />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <UsersManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <SettingsManagement />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tokens" className="mt-0">
              <div className="space-y-6">
                <Card className="glass-effect border-border/50">
                  <CardContent className="p-6">
                    <TokenManagement />
                  </CardContent>
                </Card>
                
                <Card className="glass-effect border-border/50">
                  <CardContent className="p-6">
                    <ApiDocumentation />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="mt-0">
              <Card className="glass-effect border-border/50">
                <CardContent className="p-6">
                  <WebhooksManagement />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}