import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, Check, Code, Book, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '../../config';

export default function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    toast({
      title: "Скопировано",
      description: `${label} скопирован в буфер обмена`,
    });
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints = [
    {
      method: "GET",
      path: `${API_URL}/api/sections`,
      description: "Получить все секции сайта",
      category: "Sections"
    },
    {
      method: "POST",
      path: `${API_URL}/api/sections`,
      description: "Создать новую секцию",
      category: "Sections"
    },
    {
      method: "PUT",
      path: `${API_URL}/api/sections/:id`,
      description: "Обновить секцию",
      category: "Sections"
    },
    {
      method: "GET",
      path: `${API_URL}/api/blog-posts`,
      description: "Получить все блог-посты",
      category: "Blog"
    },
    {
      method: "POST",
      path: `${API_URL}/api/blog-posts`,
      description: "Создать новый блог-пост",
      category: "Blog"
    },
    {
      method: "PUT",
      path: `${API_URL}/api/blog-posts/:id`,
      description: "Обновить блог-пост",
      category: "Blog"
    },
    {
      method: "DELETE",
      path: `${API_URL}/api/blog-posts/:id`,
      description: "Удалить блог-пост",
      category: "Blog"
    },
    {
      method: "GET",
      path: `${API_URL}/api/portfolio-items`,
      description: "Получить элементы портфолио",
      category: "Portfolio"
    },
    {
      method: "POST",
      path: `${API_URL}/api/portfolio-items`,
      description: "Создать элемент портфолио",
      category: "Portfolio"
    },
    {
      method: "PUT",
      path: `${API_URL}/api/portfolio-items/:id`,
      description: "Обновить элемент портфолио",
      category: "Portfolio"
    },
    {
      method: "DELETE",
      path: `${API_URL}/api/portfolio-items/:id`,
      description: "Удалить элемент портфолио",
      category: "Portfolio"
    },
    {
      method: "GET",
      path: `${API_URL}/api/callback-requests`,
      description: "Получить заявки на звонок",
      category: "Callbacks"
    },
    {
      method: "POST",
      path: `${API_URL}/api/callback-requests`,
      description: "Создать заявку на звонок",
      category: "Callbacks"
    },
    {
      method: "PUT",
      path: `${API_URL}/api/callback-requests/:id`,
      description: "Обновить статус заявки",
      category: "Callbacks"
    },
    {
      method: "GET",
      path: `${API_URL}/api/loyalty-program`,
      description: "Получить уровни лояльности",
      category: "Loyalty"
    },
    {
      method: "POST",
      path: `${API_URL}/api/loyalty-program`,
      description: "Создать уровень лояльности",
      category: "Loyalty"
    },
    {
      method: "PUT",
      path: `${API_URL}/api/loyalty-program/:id`,
      description: "Обновить уровень лояльности",
      category: "Loyalty"
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const categories = Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">API Документация</h2>
          <p className="text-muted-foreground">
            Полное описание REST API для интеграции с Цветокрафт
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => window.open('/api/docs', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Swagger UI
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(window.location.origin, "Base URL")}
            className="flex items-center gap-2"
          >
            {copiedEndpoint === "Base URL" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Base URL
          </Button>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="glass-effect">
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Аутентификация
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Примеры
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {categories.map(category => (
            <Card key={category} className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {apiEndpoints
                  .filter(endpoint => endpoint.category === category)
                  .map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        <span className="text-muted-foreground">
                          {endpoint.description}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          `${window.location.origin}${endpoint.path}`,
                          endpoint.path
                        )}
                        className="flex items-center gap-2"
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle>Методы аутентификации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border/30 rounded-lg">
                <h4 className="font-semibold mb-2">JWT Token</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Для административных операций используйте JWT токен в заголовке Authorization:
                </p>
                <code className="block bg-muted p-3 rounded text-sm">
                  Authorization: Bearer YOUR_JWT_TOKEN
                </code>
              </div>
              
              <div className="p-4 border border-border/30 rounded-lg">
                <h4 className="font-semibold mb-2">API Token</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Для интеграций используйте API токен (создается во вкладке "Токены"):
                </p>
                <code className="block bg-muted p-3 rounded text-sm">
                  Authorization: Bearer tk_your_api_token
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="glass-effect border-border/50">
            <CardHeader>
              <CardTitle>Примеры запросов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Получить все блог-посты</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`curl -X GET "${window.location.origin}/api/blog-posts" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Создать заявку на звонок</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`curl -X POST "${window.location.origin}/api/callback-requests" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "name": "Иван Петров",
    "phone": "+7 999 123-45-67",
    "message": "Хочу заказать букет",
    "callTime": "Завтра после 14:00"
  }'`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Обновить статус заявки</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`curl -X PUT "${window.location.origin}/api/callback-requests/1" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "status": "contacted"
  }'`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="glass-effect border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Полная документация Swagger</h4>
              <p className="text-sm text-muted-foreground">
                Для интерактивного тестирования API и подробных схем данных откройте Swagger UI
              </p>
            </div>
            <Button
              onClick={() => window.open('/api/docs', '_blank')}
              className="ml-auto"
            >
              Открыть Swagger UI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}