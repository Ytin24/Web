import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoyaltyModal({ isOpen, onClose }: LoyaltyModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: { name: string; phone: string; message: string }) => 
      apiRequest("POST", "/api/callback-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/callback-requests"] });
      setIsSubmitted(true);
      toast({
        title: "Заявка отправлена",
        description: "Мы свяжемся с вами для регистрации в программе лояльности",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Не удалось отправить заявку. Попробуйте еще раз.";
      
      // Парсим ошибку, которая приходит как строка "409: {json}"
      const errorText = error?.message || "";
      if (errorText.startsWith("409:")) {
        try {
          const jsonPart = errorText.substring(4).trim();
          const errorData = JSON.parse(jsonPart);
          errorMessage = errorData.message || "Этот номер телефона уже зарегистрирован в программе лояльности";
        } catch {
          errorMessage = "Этот номер телефона уже зарегистрирован в программе лояльности";
        }
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      name,
      phone,
      message: "Запрос на регистрацию в программе лояльности"
    });
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setPhone("");
    setName("");
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-foreground flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              Добро пожаловать!
            </DialogTitle>
            <DialogDescription className="text-center">
              Спасибо за регистрацию в программе лояльности!
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <p className="text-foreground font-medium">
                Мы свяжемся с вами в течение часа для активации карты лояльности
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-foreground/70">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>8 (800) 123-45-67</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>info@tsvetokraft.ru</span>
              </div>
            </div>
            
            <Button 
              onClick={resetAndClose}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white"
            >
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-foreground" />
            Присоединиться к программе лояльности
          </DialogTitle>
          <DialogDescription className="text-center">
            Получайте скидки и специальные предложения за ваши покупки
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-primary to-secondary text-white">
                Новичок
              </Badge>
              <p className="text-sm text-foreground/70">
                5% скидка с первого заказа
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-primary to-secondary text-white">
                Постоянный
              </Badge>
              <p className="text-sm text-foreground/70">
                10% скидка после 5 заказов
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-primary to-secondary text-white">
                VIP
              </Badge>
              <p className="text-sm text-foreground/70">
                15% скидка + приоритет
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Имя *
              </label>
              <Input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 text-base"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Номер телефона *
              </label>
              <PhoneInput
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={setPhone}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Мы свяжемся с вами для регистрации в программе лояльности
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 text-base"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
                disabled={!phone.trim() || !name.trim() || submitMutation.isPending}
              >
                {submitMutation.isPending ? "Отправляем..." : "Присоединиться"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-foreground/60 text-center">
            Регистрируясь, вы соглашаетесь с{" "}
            <a href="/privacy" className="text-foreground hover:underline">
              политикой конфиденциальности
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}