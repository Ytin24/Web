import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { ContactInfo } from "@shared/schema";
import { MapPin, Clock, Truck, Phone, Mail, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { AppleCard, AppleText, AppleButton, MagneticElement } from "@/components/animations/apple-interactions";
import GlassCard from "@/components/ui/glass-card";
import { apiRequest } from "@/lib/queryClient";
import PlayfulTooltip from "@/components/ui/playful-tooltip";
import { usePlayfulTooltips } from "@/hooks/use-playful-tooltips";

const callbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  message: z.string().optional(),
  callTime: z.string().optional(),
  consent: z.boolean().refine(val => val === true, "Необходимо согласие на обработку данных"),
});

export default function ContactSection() {
  const { toast } = useToast();
  const { getTooltip } = usePlayfulTooltips();

  // Fetch dynamic contact information
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ['/api/contact-info'],
    queryFn: async () => {
      const response = await fetch('/api/contact-info');
      if (!response.ok) throw new Error('Failed to fetch contact info');
      return response.json();
    },
  });

  // Parse social media and additional info
  const socialMedia = contactInfo?.socialMedia ? JSON.parse(contactInfo.socialMedia) : {};
  const additionalInfo = contactInfo?.additionalInfo ? JSON.parse(contactInfo.additionalInfo) : {};
  
  const form = useForm<z.infer<typeof callbackSchema>>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      callTime: "",
      consent: false,
    },
  });

  const createCallbackMutation = useMutation({
    mutationFn: async (data: z.infer<typeof callbackSchema>) => {
      const { consent, ...callbackData } = data;
      return apiRequest("POST", "/api/callback-requests", callbackData);
    },
    onSuccess: () => {
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в течение 15 минут",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof callbackSchema>) => {
    createCallbackMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-20">
          <AppleText>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">Свяжитесь с нами</h2>
          </AppleText>
          <AppleText className="delay-100">
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Оставьте заявку, и наш флорист свяжется с вами в течение 15 минут
            </p>
          </AppleText>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Contact Form */}
          <AppleCard>
            <GlassCard className="p-6 sm:p-8 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <AppleText>
                <h3 className="text-2xl font-bold text-foreground mb-6">Заказать обратный звонок</h3>
              </AppleText>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Ваше имя</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите ваше имя" 
                            className="glass-effect border-border focus:border-primary h-12 text-base"
                            autoComplete="given-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Номер телефона *</FormLabel>
                        <FormControl>
                          <PhoneInput 
                            placeholder="+7 (___) ___-__-__" 
                            className="glass-effect border-border focus:border-primary h-12"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Сообщение</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={3} 
                            placeholder="Опишите ваши пожелания..."
                            className="glass-effect border-border focus:border-primary resize-none text-base min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="callTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Когда удобно позвонить?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-effect border-border focus:border-primary h-12 text-base">
                              <SelectValue placeholder="Выберите время" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9:00 - 12:00">9:00 - 12:00</SelectItem>
                            <SelectItem value="12:00 - 15:00">12:00 - 15:00</SelectItem>
                            <SelectItem value="15:00 - 18:00">15:00 - 18:00</SelectItem>
                            <SelectItem value="18:00 - 20:00">18:00 - 20:00</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-muted-foreground leading-relaxed">
                            Я согласен на обработку персональных данных и получение информационных сообщений
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-12 floating-action font-bold text-base shadow-xl group" 
                    disabled={createCallbackMutation.isPending}
                  >
                    {createCallbackMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                        <span>Заказать звонок</span>
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    Или позвоните нам прямо сейчас: <a href={`tel:${contactInfo?.phone?.replace(/[^+\d]/g, '') || '+78001234567'}`} className="text-primary font-semibold">{contactInfo?.phone || "8 (800) 123-45-67"}</a>
                  </p>
                </form>
              </Form>
            </GlassCard>
          </AppleCard>

          {/* Contact Info */}
          <div className="space-y-8">
            {[
              {
                icon: MapPin,
                title: "Наш адрес",
                description: contactInfo?.address || "г. Москва, ул. Цветочная, д. 15",
                gradient: "from-primary to-secondary"
              },
              {
                icon: Clock,
                title: "Часы работы",
                description: contactInfo?.workingHours || "Пн-Вс: 8:00 - 22:00",
                gradient: "from-secondary to-accent"
              },
              {
                icon: Truck,
                title: "Доставка",
                description: "Бесплатно от 3000₽, иначе 300₽",
                gradient: "from-accent to-primary"
              }
            ].map((item, index) => (
              <AppleCard key={index}>
                <GlassCard className="p-6 glass-hover transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center mr-4`}>
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">{item.title}</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </AppleCard>
            ))}
            
            {/* Social Media */}
            <AppleCard>
              <GlassCard className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <AppleText>
                  <h4 className="font-semibold text-foreground text-lg mb-4">Мы в социальных сетях</h4>
                </AppleText>
                <div className="flex space-x-4">
                  {[
                    { icon: Instagram, href: "#" },
                    { icon: Mail, href: "#" },
                    { icon: Phone, href: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </AppleCard>
            
            {/* Quick Stats */}
            <AppleCard>
              <GlassCard className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <h4 className="font-semibold text-foreground text-lg mb-4">Наши достижения</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">5000+</div>
                    <div className="text-sm text-muted-foreground">Довольных клиентов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary mb-1">15</div>
                    <div className="text-sm text-muted-foreground">Лет опыта</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Поддержка</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">2ч</div>
                    <div className="text-sm text-muted-foreground">Время доставки</div>
                  </div>
                </div>
              </GlassCard>
            </AppleCard>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-float"></div>
      <div className="absolute bottom-40 left-20 w-28 h-28 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 animate-float" style={{ animationDelay: '2s' }}></div>
    </section>
  );
}
