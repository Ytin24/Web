import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bold, Italic, List, ListOrdered, Quote, Image, Link,
  Eye, Save, X, Type, AlignLeft, AlignCenter, AlignRight,
  Bot, Sparkles, Loader2, Lightbulb, Wand2
} from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { BlogPost, InsertBlogPost } from "@shared/schema";

interface ContentEditorProps {
  post?: BlogPost;
  onSave: (data: InsertBlogPost | Partial<BlogPost>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface EditorState {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
}

export default function ContentEditor({ post, onSave, onCancel, isLoading }: ContentEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'care',
    imageUrl: post?.imageUrl || '',
    isPublished: post?.isPublished || false,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const { toast } = useToast();

  const aiAssistantMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/blog-assistant', { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
      toast({ title: "Профессор Ботаникус готов помочь!" });
    },
    onError: () => {
      toast({ 
        title: "Профессор Ботаникус недоступен", 
        description: "Попробуйте позже или обратитесь к администратору",
        variant: "destructive" 
      });
    }
  });

  const categories = [
    { value: 'care', label: 'Уход за цветами' },
    { value: 'seasonal', label: 'Сезонные советы' },
    { value: 'arrangement', label: 'Композиции' },
    { value: 'water', label: 'Полив' },
    { value: 'fertilizer', label: 'Удобрения' },
    { value: 'pruning', label: 'Обрезка' }
  ];

  const handleInputChange = (field: keyof EditorState, value: string | boolean) => {
    setEditorState(prev => ({ ...prev, [field]: value }));
  };

  const insertTextAtCursor = (textArea: HTMLTextAreaElement, text: string) => {
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const content = editorState.content;
    
    const newContent = content.substring(0, start) + text + content.substring(end);
    handleInputChange('content', newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleFormatting = (format: string) => {
    const textArea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = editorState.content.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'жирный текст'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'курсив'}*`;
        break;
      case 'heading':
        formattedText = `## ${selectedText || 'Заголовок'}`;
        break;
      case 'list':
        formattedText = `- ${selectedText || 'элемент списка'}`;
        break;
      case 'ordered-list':
        formattedText = `1. ${selectedText || 'элемент списка'}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'цитата'}`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'текст ссылки'}](https://example.com)`;
        break;
      case 'image':
        formattedText = `![${selectedText || 'описание изображения'}](URL_изображения)`;
        break;
      default:
        return;
    }
    
    insertTextAtCursor(textArea, formattedText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title: editorState.title,
      excerpt: editorState.excerpt,
      content: editorState.content,
      category: editorState.category,
      imageUrl: editorState.imageUrl || null,
      isPublished: editorState.isPublished,
    };

    onSave(data);
  };

  const renderPreview = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-4 mb-3">$1</h3>')
      .replace(/^- (.*$)/gm, '<ul><li class="ml-4">• $1</li></ul>')
      .replace(/^\d+\. (.*$)/gm, '<ol><li class="ml-4">$1</li></ol>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {post ? 'Редактировать статью' : 'Создать новую статью'}
        </h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Редактор' : 'Предпросмотр'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={editorState.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введите заголовок статьи..."
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Краткое описание</Label>
              <Textarea
                id="excerpt"
                value={editorState.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Краткое описание для превью..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Категория</Label>
                <Select
                  value={editorState.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="imageUrl">URL изображения</Label>
                <Input
                  id="imageUrl"
                  value={editorState.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="/api/images/blog-care-1.svg"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={editorState.isPublished}
                onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="isPublished">Опубликовать статью</Label>
              {editorState.isPublished && (
                <Badge className="bg-green-100 text-secondary dark:bg-green-900 dark:text-secondary">
                  Будет опубликована
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Контент</CardTitle>
            {!previewMode && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('heading')}
                >
                  <Type className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('ordered-list')}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('quote')}
                >
                  <Quote className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('link')}
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFormatting('image')}
                >
                  <Image className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {previewMode ? (
              <div className="min-h-[300px] p-4 border border-border rounded-md bg-muted/50">
                <div 
                  className="prose max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview(editorState.content || 'Пустой контент...') 
                  }}
                />
              </div>
            ) : (
              <Textarea
                id="content-editor"
                value={editorState.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Напишите содержание статьи... Используйте **жирный** и *курсив* для форматирования."
                rows={20}
                className="font-mono text-sm"
                required
              />
            )}
            
            {!previewMode && (
              <div className="mt-2 text-sm text-muted-foreground">
                Символов: {editorState.content.length} | 
                Поддерживается Markdown: **жирный**, *курсив*, ## заголовок, - список
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
}