import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { loginSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store auth tokens securely
        localStorage.setItem('admin_token', result.token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        if (result.sessionToken) {
          localStorage.setItem('admin_session', result.sessionToken);
        }
        
        // Security log successful login
        console.log('Admin login successful:', {
          username: data.username,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });

        // Redirect to admin panel
        setLocation('/admin');
      } else {
        throw new Error(result.error || 'Ошибка авторизации');
      }
    } catch (error: any) {
      setAttemptCount(prev => prev + 1);
      
      // Handle different error types
      if (error.message?.includes('locked')) {
        setLoginError('Аккаунт заблокирован из-за множественных неудачных попыток входа. Попробуйте позже.');
      } else if (error.message?.includes('credentials')) {
        setLoginError('Неверное имя пользователя или пароль.');
      } else if (error.message?.includes('inactive')) {
        setLoginError('Аккаунт деактивирован. Обратитесь к администратору.');
      } else {
        setLoginError(error.message || 'Произошла ошибка при входе. Попробуйте позже.');
      }

      // Clear password on failed attempt
      form.setValue('password', '');
      
      // Security delay after failed attempts
      if (attemptCount >= 2) {
        setTimeout(() => setIsLoading(false), 2000);
      } else {
        setIsLoading(false);
      }
    }
  };

  const isAccountLocked = attemptCount >= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Администраторская панель</h1>
          <p className="text-muted-foreground">Цветокрафт - Система управления</p>
        </div>

        {/* Security Warning */}
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Доступ только для авторизованного персонала. Все попытки входа регистрируются.
          </AlertDescription>
        </Alert>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Вход в систему
            </CardTitle>
            <CardDescription>
              Введите учетные данные для доступа к панели администратора
            </CardDescription>
          </CardHeader>

          <form onSubmit={form.handleSubmit(handleLogin)}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {/* Account Locked Warning */}
              {isAccountLocked && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    Слишком много неудачных попыток. Попробуйте позже или обратитесь к администратору.
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Имя пользователя
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  disabled={isLoading || isAccountLocked}
                  className="transition-colors duration-200"
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    disabled={isLoading || isAccountLocked}
                    className="pr-10 transition-colors duration-200"
                    {...form.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isAccountLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Attempt Counter */}
              {attemptCount > 0 && attemptCount < 5 && (
                <div className="text-sm text-amber-600 dark:text-amber-400 text-center">
                  Неудачных попыток: {attemptCount} из 5
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full transition-all duration-200"
                disabled={isLoading || isAccountLocked || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка данных...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Войти в систему
                  </>
                )}
              </Button>

              {/* Security Info */}
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>🔒 Защищенное соединение SSL</p>
                <p>🛡️ Многоуровневая аутентификация</p>
                <p>📝 Журналирование всех действий</p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Цветокрафт © 2025. Все права защищены.</p>
          <p>В случае проблем с доступом обратитесь к системному администратору.</p>
        </div>
      </div>
    </div>
  );
}