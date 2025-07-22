import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="glass-effect"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </div>
            
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold text-[hsl(213,27%,19%)] mb-6">Политика конфиденциальности</h1>
                <p className="text-xl text-[hsl(213,27%,19%)]/70 max-w-2xl mx-auto leading-relaxed">
                  Мы заботимся о защите ваших персональных данных
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="prose prose-lg max-w-none bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h2>1. Общие положения</h2>
                <p>
                  Настоящая политика конфиденциальности определяет порядок обработки персональных данных 
                  пользователей сайта Цветокрафт. Мы обязуемся обеспечить надежную защиту доверенной нам информации.
                </p>

                <h2>2. Сбор персональных данных</h2>
                <p>Мы собираем следующие персональные данные:</p>
                <ul>
                  <li>Имя и фамилия</li>
                  <li>Номер телефона</li>
                  <li>Электронная почта (при указании)</li>
                  <li>Сообщения и комментарии</li>
                  <li>Предпочтительное время для звонка</li>
                </ul>

                <h2>3. Цели обработки данных</h2>
                <p>Ваши персональные данные используются для:</p>
                <ul>
                  <li>Обработки заявок на обратный звонок</li>
                  <li>Консультаций по цветочным композициям</li>
                  <li>Уведомлений о новых услугах и акциях</li>
                  <li>Улучшения качества обслуживания</li>
                </ul>

                <h2>4. Обработка и хранение данных</h2>
                <p>
                  Персональные данные обрабатываются с соблюдением требований действующего законодательства РФ. 
                  Данные хранятся в защищенных системах и не передаются третьим лицам без вашего согласия.
                </p>

                <h2>5. Согласие на обработку</h2>
                <p>
                  Отправляя форму обратного звонка, вы даете согласие на обработку указанных персональных данных 
                  в соответствии с настоящей политикой конфиденциальности.
                </p>

                <h2>6. Права пользователя</h2>
                <p>Вы имеете право:</p>
                <ul>
                  <li>Получать информацию об обработке ваших персональных данных</li>
                  <li>Требовать уточнения, изменения или удаления персональных данных</li>
                  <li>Отозвать согласие на обработку персональных данных</li>
                </ul>

                <h2>7. Безопасность данных</h2>
                <p>
                  Мы применяем современные технические и организационные меры для защиты персональных данных 
                  от несанкционированного доступа, изменения, раскрытия или уничтожения.
                </p>

                <h2>8. Изменения в политике</h2>
                <p>
                  Мы оставляем за собой право вносить изменения в настоящую политику конфиденциальности. 
                  Обновленная версия публикуется на сайте с указанием даты последнего изменения.
                </p>

                <h2>9. Контактная информация</h2>
                <p>
                  По вопросам обработки персональных данных обращайтесь:
                </p>
                <ul>
                  <li>Телефон: 8 (800) 123-45-67</li>
                  <li>Email: privacy@tsvetokraft.ru</li>
                  <li>Адрес: г. Москва, ул. Цветочная, д. 15</li>
                </ul>

                <div className="mt-8 p-4 bg-gradient-to-r from-[hsl(252,100%,71%)]/10 to-[hsl(340,100%,69%)]/10 rounded-lg">
                  <p className="text-sm font-medium text-[hsl(213,27%,19%)]">
                    Дата последнего обновления: 22 января 2025 года
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}