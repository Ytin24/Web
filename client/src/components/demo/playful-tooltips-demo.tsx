import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Sparkles, Flower, Smile } from "lucide-react";
import PlayfulTooltip from "@/components/ui/playful-tooltip";

export default function PlayfulTooltipsDemo() {
  return (
    <Card className="max-w-2xl mx-auto m-8">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Игривые подсказки с характером
          <Sparkles className="w-6 h-6 text-purple-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-muted-foreground">
          Наведите на кнопки и почувствуйте магию наших цветочных подсказок!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Cheerful Personality */}
          <PlayfulTooltip
            content="Солнышко, вы на правильном пути!"
            personality="cheerful"
            side="top"
            delay={300}
          >
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Smile className="w-5 h-5" />
              <span className="text-sm">Радостный</span>
            </Button>
          </PlayfulTooltip>

          {/* Wise Personality */}
          <PlayfulTooltip
            content="Каждый цветок знает свое время"
            personality="wise"
            side="top"
            delay={300}
          >
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Flower className="w-5 h-5" />
              <span className="text-sm">Мудрый</span>
            </Button>
          </PlayfulTooltip>

          {/* Excited Personality */}
          <PlayfulTooltip
            content="Не могу сдержать восторг! 🎉"
            personality="excited"
            side="top"
            delay={300}
          >
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Восторженный</span>
            </Button>
          </PlayfulTooltip>

          {/* Caring Personality */}
          <PlayfulTooltip
            content="Забота - это основа красоты"
            personality="caring"
            side="bottom"
            delay={300}
          >
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Заботливый</span>
            </Button>
          </PlayfulTooltip>

          {/* Mysterious Personality */}
          <PlayfulTooltip
            content="Секреты сада открываются..."
            personality="mysterious"
            side="bottom"
            delay={300}
          >
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
              <Star className="w-5 h-5" />
              <span className="text-sm">Загадочный</span>
            </Button>
          </PlayfulTooltip>

          {/* Special Long Hover Demo */}
          <PlayfulTooltip
            content="Держите курсор подольше для сюрприза!"
            personality="excited"
            side="bottom"
            delay={200}
          >
            <Button className="w-full h-16 flex flex-col gap-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Сюрприз</span>
            </Button>
          </PlayfulTooltip>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            ✨ Каждая подсказка имеет свой характер и эмоции
          </p>
          <p className="text-sm text-muted-foreground">
            🌸 Подержите курсор дольше 1.5 секунд для особых сообщений
          </p>
        </div>
      </CardContent>
    </Card>
  );
}