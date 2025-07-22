import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Home, BookOpen, Image, Star, Phone, Plus, Edit, Trash2, 
  Save, X, Eye, EyeOff, Activity, Users, TrendingUp, Clock
} from "lucide-react";
import BlogManagement from "@/components/admin/blog-management";
import PortfolioManagement from "@/components/admin/portfolio-management";
import SectionsManagement from "@/components/admin/sections-management";
import CallbackRequests from "@/components/admin/callback-requests";
import LoyaltyProgramManagement from "@/components/admin/loyalty-management";
import { apiRequest } from "@/lib/queryClient";
import type { Section, BlogPost, PortfolioItem, CallbackRequest, LoyaltyProgram } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  // Queries for dashboard data
  const { data: sections } = useQuery<Section[]>({
    queryKey: ["/api/sections"]
  });

  const { data: callbackRequests } = useQuery<CallbackRequest[]>({
    queryKey: ["/api/callback-requests"]
  });

  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"]
  });

  const { data: portfolioItems } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio-items"]
  });

  const { data: loyaltyPrograms } = useQuery<LoyaltyProgram[]>({
    queryKey: ["/api/loyalty-program"]
  });

  // Dashboard statistics
  const pendingRequests = callbackRequests?.filter(req => req.status === 'pending').length || 0;
  const publishedBlogs = blogPosts?.filter(post => post.isPublished).length || 0;
  const activePortfolios = portfolioItems?.filter(item => item.isActive).length || 0;
  const totalLoyaltyLevels = loyaltyPrograms?.length || 0;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Новые заявки</CardTitle>
              <Phone className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{pendingRequests}</div>
            <div className="text-sm text-red-600/70 mt-1">Требуют обработки</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Статьи блога</CardTitle>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{publishedBlogs}</div>
            <div className="text-sm text-blue-600/70 mt-1">Опубликовано</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Портфолио</CardTitle>
              <Image className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activePortfolios}</div>
            <div className="text-sm text-green-600/70 mt-1">Активных работ</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Лояльность</CardTitle>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalLoyaltyLevels}</div>
            <div className="text-sm text-purple-600/70 mt-1">Уровней программы</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Последние заявки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callbackRequests?.slice(0, 5).map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{request.name}</div>
                    <div className="text-sm text-gray-600">{request.phone}</div>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'destructive' : 'secondary'}>
                    {request.status === 'pending' ? 'Ожидает' : 'Обработан'}
                  </Badge>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  Заявок пока нет
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Статистика контента
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Всего статей:</span>
                <span className="font-semibold">{blogPosts?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Черновики:</span>
                <span className="font-semibold">{(blogPosts?.length || 0) - publishedBlogs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Работы в портфолио:</span>
                <span className="font-semibold">{portfolioItems?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Скрытых работ:</span>
                <span className="font-semibold">{(portfolioItems?.length || 0) - activePortfolios}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => setActiveTab("blog")} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Plus className="w-6 h-6" />
              Новая статья
            </Button>
            <Button 
              onClick={() => setActiveTab("portfolio")} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Image className="w-6 h-6" />
              Добавить работу
            </Button>
            <Button 
              onClick={() => setActiveTab("requests")} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Phone className="w-6 h-6" />
              Обработать заявки
            </Button>
            <Button 
              onClick={() => setActiveTab("sections")} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Edit className="w-6 h-6" />
              Редактировать секции
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Панель управления Цветокрафт</h1>
            <p className="text-gray-600">Управление контентом и заявками</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Онлайн
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Секции
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Блог
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Портфолио
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Лояльность
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 relative">
              <Phone className="w-4 h-4" />
              Заявки
              {pendingRequests > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500">
                  {pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="sections">
            <SectionsManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioManagement />
          </TabsContent>

          <TabsContent value="loyalty">
            <LoyaltyProgramManagement />
          </TabsContent>

          <TabsContent value="requests">
            <CallbackRequests />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}