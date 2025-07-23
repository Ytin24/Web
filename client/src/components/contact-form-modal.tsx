import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Send, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const callbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
  callTime: z.string().optional(),
  consent: z.boolean().refine(val => val === true, "Необходимо согласие на обработку данных"),
});

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  title?: string;
  description?: string;
}

export default function ContactFormModal({ 
  isOpen, 
  onClose, 
  initialMessage = "",
  title = "Связаться с нами",
  description = "Заполните форму и мы свяжемся с вами в течение 15 минут"
}: ContactFormModalProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof callbackSchema>>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: initialMessage,
      callTime: "",
      consent: false,
    },
  });

  // Reset form when modal opens with new initial message
  React.useEffect(() => {
    if (isOpen && initialMessage) {
      form.reset({
        name: "",
        phone: "",
        message: initialMessage,
        callTime: "",
        consent: false,
      });
    }
  }, [isOpen, initialMessage, form]);

  const createCallbackMutation = useMutation({
    mutationFn: async (data: z.infer<typeof callbackSchema>) => {
      const { consent, ...callbackData } = data;
      return apiRequest("POST", "/api/callback-requests", callbackData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в течение 15 минут",
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
          errorMessage = errorData.message || "Этот номер телефона уже зарегистрирован";
        } catch {
          errorMessage = "Этот номер телефона уже зарегистрирован";
        }
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof callbackSchema>) => {
    createCallbackMutation.mutate(data);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    form.reset();
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-foreground flex items-center justify-center gap-2">
              <Phone className="w-6 h-6 text-primary" />
              Заявка отправлена!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Спасибо за обращение! Наш менеджер свяжется с вами в течение 15 минут для консультации и оформления заказа.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Ваше имя</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Как к вам обращаться?"
                      className="bg-background"
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
                  <FormLabel className="text-foreground">Номер телефона</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+7 (999) 123-45-67"
                      type="tel"
                      className="bg-background"
                      {...field}
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
                  <FormLabel className="text-foreground">Сообщение</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите о ваших пожеланиях..."
                      className="bg-background min-h-[100px] resize-none"
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
                  <FormLabel className="text-foreground">Удобное время для звонка (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: после 18:00"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
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
              className="w-full h-11"
              disabled={createCallbackMutation.isPending}
            >
              {createCallbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить заявку
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}