import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import { 
  Bot, Sparkles, Loader2, Lightbulb, Wand2, Copy, Check, X, FileText 
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogAiAssistantProps {
  onContentGenerated?: (content: string) => void;
}

export default function BlogAiAssistant({ onContentGenerated }: BlogAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/blog-assistant', { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setResponse(data.response);
      toast({ 
        title: "Профессор Ботаникус готов!", 
        description: "Эксперт создал контент для вас" 
      });
    },
    onError: () => {
      toast({ 
        title: "Профессор Ботаникус недоступен", 
        description: "Попробуйте позже или обратитесь к администратору",
        variant: "destructive" 
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ 
        title: "Введите запрос", 
        description: "Опишите что вы хотите создать",
        variant: "destructive" 
      });
      return;
    }
    aiMutation.mutate(prompt);
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      toast({ title: "Скопировано в буфер обмена!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setPrompt('');
    setResponse('');
    setCopied(false);
  };

  const quickPrompts = [
    'Предложи 5 идей для статей о зимнем уходе за комнатными растениями',
    'Напиши статью о правильном поливе орхидей',
    'Создай руководство по выбору цветов для свадебного букета',
    'Расскажи об истории и символике роз',
    'Напиши о сезонной обрезке садовых цветов'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI Эксперт
          <Sparkles className="w-3 h-3 ml-2 text-green-500" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Профессор Ботаникус
              </DialogTitle>
              <DialogDescription>
                AI-эксперт по флористике и ботанике для создания качественного контента
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              30 лет опыта
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Запрос к эксперту
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Что вы хотите создать?</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Например: 'Напиши статью о весеннем уходе за розами' или 'Создай руководство по выбору горшков для фиалок'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleGenerate}
                  disabled={aiMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {aiMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {aiMutation.isPending ? 'Создает контент...' : 'Создать контент'}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <X className="w-4 h-4 mr-2" />
                  Очистить
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Быстрые идеи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {quickPrompts.map((quickPrompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrompt(quickPrompt)}
                    className="text-xs h-auto p-2 text-left whitespace-normal bg-muted hover:bg-muted/80"
                  >
                    {quickPrompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response */}
          {response && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Ответ эксперта
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? 'Скопировано' : 'Копировать'}
                    </Button>
                    {onContentGenerated && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onContentGenerated(response);
                          setIsOpen(false);
                          toast({ title: "Контент передан в редактор!" });
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Использовать
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96 w-full">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-green-700 dark:text-green-300">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-green-600 dark:text-green-400">{children}</h2>,
                        h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-green-600 dark:text-green-400">{children}</h3>,
                        p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                        strong: ({children}) => <strong className="font-semibold text-green-700 dark:text-green-300">{children}</strong>,
                        em: ({children}) => <em className="italic text-green-600 dark:text-green-400">{children}</em>,
                      }}
                    >
                      {response}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}