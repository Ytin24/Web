import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, Phone, Mail } from "lucide-react";

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoyaltyModal({ isOpen, onClose }: LoyaltyModalProps) {
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the phone number to join loyalty program
    setIsSubmitted(true);
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setPhone("");
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[hsl(213,27%,19%)] flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-[hsl(252,100%,71%)]" />
              Добро пожаловать!
            </DialogTitle>
            <DialogDescription className="text-center">
              Спасибо за регистрацию в программе лояльности!
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-[hsl(252,100%,71%)]/10 to-[hsl(340,100%,69%)]/10 rounded-lg">
              <p className="text-[hsl(213,27%,19%)] font-medium">
                Мы свяжемся с вами в течение часа для активации карты лояльности
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-[hsl(213,27%,19%)]/70">
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
              className="w-full bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-[hsl(213,27%,19%)] flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-[hsl(252,100%,71%)]" />
            Присоединиться к программе лояльности
          </DialogTitle>
          <DialogDescription className="text-center">
            Получайте скидки и специальные предложения за ваши покупки
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-[hsl(252,100%,71%)]/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white">
                Новичок
              </Badge>
              <p className="text-sm text-[hsl(213,27%,19%)]/70">
                5% скидка с первого заказа
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-[hsl(340,100%,69%)]/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-[hsl(340,100%,69%)] to-[hsl(252,100%,71%)] text-white">
                Постоянный
              </Badge>
              <p className="text-sm text-[hsl(213,27%,19%)]/70">
                10% скидка после 5 заказов
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-[hsl(74,64%,59%)]/10 to-transparent rounded-lg">
              <Badge className="mb-2 bg-gradient-to-r from-[hsl(74,64%,59%)] to-[hsl(340,100%,69%)] text-white">
                VIP
              </Badge>
              <p className="text-sm text-[hsl(213,27%,19%)]/70">
                15% скидка + приоритет
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(213,27%,19%)] mb-2">
                Номер телефона *
              </label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-[hsl(213,27%,19%)]/60 mt-1">
                Мы отправим SMS с деталями программы лояльности
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[hsl(252,100%,71%)] to-[hsl(340,100%,69%)] text-white"
                disabled={!phone.trim()}
              >
                Присоединиться
              </Button>
            </div>
          </form>

          <div className="text-xs text-[hsl(213,27%,19%)]/60 text-center">
            Регистрируясь, вы соглашаетесь с{" "}
            <a href="/privacy" className="text-[hsl(252,100%,71%)] hover:underline">
              политикой конфиденциальности
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}