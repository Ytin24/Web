import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PlayfulTooltipsDemo from "@/components/demo/playful-tooltips-demo";

export default function TooltipsDemo() {
  return (
    <div className="min-h-screen bg-muted/50 overflow-x-hidden">
      <Navigation />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Игривые подсказки
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Демонстрация системы подсказок с характером - каждый элемент интерфейса 
              получает свою личность и эмоции для улучшения пользовательского опыта
            </p>
          </div>
          <PlayfulTooltipsDemo />
        </div>
      </main>
      <Footer />
    </div>
  );
}