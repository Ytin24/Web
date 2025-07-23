import { useState } from "react";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Save, Globe, MessageCircle } from "lucide-react";
import type { ContactInfo } from "@shared/schema";

// Form validation schema
const contactFormSchema = z.object({
  phone: z.string().min(1, "Телефон обязателен"),
  email: z.string().email("Неверный формат email"),
  address: z.string().min(1, "Адрес обязателен"),
  workingHours: z.string().min(1, "Рабочие часы обязательны"),
  telegram: z.string().optional(),
  instagram: z.string().optional(),
  vk: z.string().optional(),
  whatsapp: z.string().optional(),
  mapUrl: z.string().url().optional().or(z.literal(""))
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch contact information
  const { data: contactInfo, isLoading } = useQuery<ContactInfo>({
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

  // Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      phone: contactInfo?.phone || "",
      email: contactInfo?.email || "",
      address: contactInfo?.address || "",
      workingHours: contactInfo?.workingHours || "",
      telegram: socialMedia.telegram || "",
      instagram: socialMedia.instagram || "",
      vk: socialMedia.vk || "",
      whatsapp: additionalInfo.whatsapp || "",
      mapUrl: additionalInfo.mapUrl || ""
    }
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const payload = {
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        socialMedia: JSON.stringify({
          telegram: data.telegram,
          instagram: data.instagram,
          vk: data.vk
        }),
        additionalInfo: JSON.stringify({
          whatsapp: data.whatsapp,
          mapUrl: data.mapUrl
        })
      };

      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update contact info');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Контакты обновлены",
        description: "Информация о контактах успешно сохранена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact-info'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить контакты",
        variant: "destructive",
      });
    },
  });

  // Reset form when contact info changes
  React.useEffect(() => {
    if (contactInfo) {
      const socialMedia = contactInfo.socialMedia ? JSON.parse(contactInfo.socialMedia) : {};
      const additionalInfo = contactInfo.additionalInfo ? JSON.parse(contactInfo.additionalInfo) : {};
      
      form.reset({
        phone: contactInfo.phone,
        email: contactInfo.email,
        address: contactInfo.address,
        workingHours: contactInfo.workingHours,
        telegram: socialMedia.telegram || "",
        instagram: socialMedia.instagram || "",
        vk: socialMedia.vk || "",
        whatsapp: additionalInfo.whatsapp || "",
        mapUrl: additionalInfo.mapUrl || ""
      });
    }
  }, [contactInfo, form]);

  const onSubmit = (data: ContactFormData) => {
    updateContactMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Управление контактами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Управление контактами
        </CardTitle>
        <CardDescription>
          Редактируйте контактную информацию, отображаемую на сайте
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Телефон
              </Label>
              <Input
                id="phone"
                {...form.register("phone")}
                disabled={!isEditing}
                className="glass-effect"
                placeholder="8 (800) 123-45-67"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                disabled={!isEditing}
                className="glass-effect"
                placeholder="info@tsvetokraft.ru"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Адрес
            </Label>
            <Input
              id="address"
              {...form.register("address")}
              disabled={!isEditing}
              className="glass-effect"
              placeholder="г. Москва, ул. Цветочная, д. 15"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Рабочие часы
            </Label>
            <Input
              id="workingHours"
              {...form.register("workingHours")}
              disabled={!isEditing}
              className="glass-effect"
              placeholder="Пн-Вс: 8:00 - 22:00"
            />
            {form.formState.errors.workingHours && (
              <p className="text-sm text-destructive">{form.formState.errors.workingHours.message}</p>
            )}
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Социальные сети</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  {...form.register("telegram")}
                  disabled={!isEditing}
                  className="glass-effect"
                  placeholder="@tsvetokraft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  {...form.register("instagram")}
                  disabled={!isEditing}
                  className="glass-effect"
                  placeholder="@tsvetokraft_moscow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vk" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  VKontakte
                </Label>
                <Input
                  id="vk"
                  {...form.register("vk")}
                  disabled={!isEditing}
                  className="glass-effect"
                  placeholder="vk.com/tsvetokraft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  {...form.register("whatsapp")}
                  disabled={!isEditing}
                  className="glass-effect"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="mapUrl" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ссылка на карту
            </Label>
            <Input
              id="mapUrl"
              {...form.register("mapUrl")}
              disabled={!isEditing}
              className="glass-effect"
              placeholder="https://yandex.ru/maps/?text=55.751244,37.618423"
            />
            {form.formState.errors.mapUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.mapUrl.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Редактировать
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={updateContactMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateContactMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  Отменить
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}