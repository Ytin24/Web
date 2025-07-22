import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContentEditor from "@/components/admin/content-editor";
import CallbackRequests from "@/components/admin/callback-requests";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings, Home, BookOpen, Image, Star, Phone } from "lucide-react";
import type { Section, BlogPost, PortfolioItem, CallbackRequest } from "@shared/schema";

type AdminSection = "dashboard" | "about" | "blog" | "portfolio" | "loyalty" | "requests";

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
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

  const navigationItems = [
    { key: "dashboard", label: "Главная панель", icon: Home },
    { key: "about", label: "О нас", icon: Settings },
    { key: "blog", label: "Блог", icon: BookOpen },
    { key: "portfolio", label: "Портфолио", icon: Image },
    { key: "loyalty", label: "Лояльность", icon: Star },
    { key: "requests", label: "Заявки", icon: Phone },
  ];

  const pendingRequests = callbackRequests?.filter((req: any) => req.status === 'pending').length || 0;

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Заявки на звонок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingRequests}</div>
            <div className="text-xs text-gray-500">Ожидают ответа</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Статьи блога</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{blogPosts?.length || 0}</div>
            <div className="text-xs text-gray-500">Всего статей</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Работы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{portfolioItems?.length || 0}</div>
            <div className="text-xs text-gray-500">В портфолио</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Разделы сайта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{sections?.length || 0}</div>
            <div className="text-xs text-gray-500">Активных разделов</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {callbackRequests?.slice(0, 5).map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{request.name}</p>
                  <p className="text-sm text-gray-600">Запрос обратного звонка</p>
                  <p className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <Badge variant={request.status === 'pending' ? 'destructive' : 'default'}>
                  {request.status === 'pending' ? 'Ожидает' : 
                   request.status === 'contacted' ? 'Связались' : 'Завершено'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (activeSection === "dashboard") return renderDashboard();
    if (activeSection === "requests") return <CallbackRequests />;
    return <ContentEditor section={activeSection} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="glass-effect">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[hsl(213,27%,19%)]">Панель управления Цветокрафт</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="glass-effect"
            >
              Вернуться на сайт
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Разделы управления</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveSection(item.key as AdminSection)}
                        className={`w-full flex items-center p-3 text-left transition-all rounded-lg ${
                          activeSection === item.key
                            ? 'bg-[hsl(252,100%,71%)] text-white'
                            : 'hover:bg-white/20 text-[hsl(213,27%,19%)]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                        {item.key === "requests" && pendingRequests > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {pendingRequests}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {sectionsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-3">Загрузка...</span>
                </CardContent>
              </Card>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
