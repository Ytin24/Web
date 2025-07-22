import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Flower, Heart, Gift, Users, GraduationCap, 
  Star, Calendar, DollarSign, Loader2, Sparkles 
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface FlowerRecommendation {
  bouquetName: string;
  flowers: string[];
  colors: string[];
  occasion: string;
  priceRange: string;
  description: string;
  careInstructions: string;
}

export default function FlowerRecommendation() {
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<FlowerRecommendation | null>(null);
  const { toast } = useToast();

  const occasions = [
    { value: 'birthday', label: 'День рождения', icon: Gift },
    { value: 'wedding', label: 'Свадьба', icon: Heart },
    { value: 'corporate', label: 'Корпоративное мероприятие', icon: Users },
    { value: 'graduation', label: 'Выпускной', icon: GraduationCap },
    { value: 'apology', label: 'Извинение', icon: Star },
    { value: 'anniversary', label: 'Годовщина', icon: Calendar },
    { value: 'other', label: 'Другое', icon: Flower }
  ];

  const budgetRanges = [
    '1000-2000 руб',
    '2000-3500 руб', 
    '3500-5000 руб',
    '5000-8000 руб',
    '8000+ руб'
  ];

  const colorOptions = [
    'красный', 'розовый', 'белый', 'желтый', 
    'фиолетовый', 'синий', 'оранжевый', 'смешанный'
  ];

  const recommendMutation = useMutation({
    mutationFn: async (data: { occasion: string; budget: string; preferences: string; colors?: string[] }) => {
      const response = await fetch('/api/chatbot/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Ошибка получения рекомендации');
      }

      return response.json();
    },
    onSuccess: (data: FlowerRecommendation) => {
      setRecommendation(data);
      toast({
        title: "Рекомендация готова!",
        description: "Персональная рекомендация букета создана для вас",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать рекомендацию. Попробуйте еще раз.",
        variant: "destructive",
      });
      console.error('Recommendation error:', error);
    }
  });

  const handleRecommend = () => {
    if (!occasion || !budget || !preferences) {
      toast({
        title: "Заполните все поля",
        description: "Для создания рекомендации нужно заполнить повод, бюджет и предпочтения",
        variant: "destructive",
      });
      return;
    }

    recommendMutation.mutate({
      occasion: occasions.find(o => o.value === occasion)?.label || occasion,
      budget,
      preferences,
      colors: colors.length > 0 ? colors : undefined
    });
  };

  const toggleColor = (color: string) => {
    setColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleContactRequest = () => {
    // Scroll to contact section
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, redirect to home with hash
      window.location.href = '/#contact';
    }
    
    toast({
      title: "Переход к контактам",
      description: "Свяжитесь с нами для заказа рекомендованного букета",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Рекомендации Букетов
          </CardTitle>
          <p className="text-muted-foreground">
            Получите персональную рекомендацию букета на основе ваших предпочтений
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Occasion Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Повод</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {occasions.map((occ) => {
                const Icon = occ.icon;
                return (
                  <Card
                    key={occ.value}
                    className={`cursor-pointer transition-all ${
                      occasion === occ.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setOccasion(occ.value)}
                  >
                    <CardContent className="p-3 text-center">
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs font-medium">{occ.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Budget Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Бюджет</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите бюджет" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Предпочитаемые цвета (необязательно)</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <Badge
                  key={color}
                  variant={colors.includes(color) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleColor(color)}
                >
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Дополнительные предпочтения</Label>
            <Textarea
              placeholder="Например: любимые цветы, стиль букета, особые пожелания..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleRecommend}
            disabled={recommendMutation.isPending || !occasion || !budget || !preferences}
            className="w-full"
            size="lg"
          >
            {recommendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Создаю рекомендацию...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Получить рекомендацию
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendation Result */}
      {recommendation && (
        <Card className="glass-effect border-border/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flower className="w-5 h-5 text-primary" />
              {recommendation.bouquetName}
            </CardTitle>
            <p className="text-primary font-semibold">{recommendation.priceRange}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Описание</h4>
              <p className="text-muted-foreground leading-relaxed">
                {recommendation.description}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Цветы</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.flowers.map((flower, index) => (
                    <Badge key={index} variant="secondary">
                      {flower}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Цвета</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.colors.map((color, index) => (
                    <Badge key={index} variant="outline">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Уход за букетом</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {recommendation.careInstructions}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleContactRequest} className="flex-1">
                <DollarSign className="w-4 h-4 mr-2" />
                Заказать букет
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRecommendation(null)}
              >
                Новая рекомендация
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}