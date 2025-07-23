import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useDeviceDetection } from '@/hooks/use-device-detection';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value = '', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { isMobile } = useDeviceDetection();

    // Функция для форматирования номера телефона
    const formatPhoneNumber = (input: string): string => {
      // Удаляем все символы кроме цифр
      const digits = input.replace(/\D/g, '');
      
      // Если пустая строка, возвращаем пустую строку
      if (!digits) return '';
      
      // Если начинается не с 7 и не с 8, добавляем 7
      let normalizedDigits = digits;
      if (digits[0] === '8') {
        normalizedDigits = '7' + digits.slice(1);
      } else if (digits[0] !== '7') {
        normalizedDigits = '7' + digits;
      }
      
      // Ограничиваем до 11 цифр (7 + 10 цифр номера)
      normalizedDigits = normalizedDigits.slice(0, 11);
      
      // Форматируем в шаблон +7 (xxx) xxx-xx-xx
      if (normalizedDigits.length >= 1) {
        let formatted = '+7';
        if (normalizedDigits.length > 1) {
          formatted += ' (';
          formatted += normalizedDigits.slice(1, 4);
          if (normalizedDigits.length > 4) {
            formatted += ') ';
            formatted += normalizedDigits.slice(4, 7);
            if (normalizedDigits.length > 7) {
              formatted += '-';
              formatted += normalizedDigits.slice(7, 9);
              if (normalizedDigits.length > 9) {
                formatted += '-';
                formatted += normalizedDigits.slice(9, 11);
              }
            }
          }
        }
        return formatted;
      }
      
      return '';
    };

    // Получаем только цифры из отформатированного номера
    const getCleanNumber = (formatted: string): string => {
      return formatted.replace(/\D/g, '');
    };

    // Обновляем отображаемое значение при изменении value извне
    useEffect(() => {
      if (value !== getCleanNumber(displayValue)) {
        setDisplayValue(formatPhoneNumber(value));
      }
    }, [value, displayValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const formatted = formatPhoneNumber(newValue);
      setDisplayValue(formatted);
      
      // Передаем только цифры в onChange
      const cleanNumber = getCleanNumber(formatted);
      onChange?.(cleanNumber);
    };

    const handleFocus = () => {
      // При фокусе, если поле пустое, ставим +7 (
      if (!displayValue) {
        const formatted = '+7 (';
        setDisplayValue(formatted);
        onChange?.(getCleanNumber(formatted));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Обрабатываем удаление
      if (e.key === 'Backspace') {
        const currentValue = displayValue;
        // Если пытаемся удалить с позиции после +7, не даем это сделать
        const cursorPosition = inputRef.current?.selectionStart || 0;
        if (cursorPosition <= 2 && currentValue.startsWith('+7')) {
          e.preventDefault();
        }
      }
    };

    // Мемоизируем финальные стили для производительности
    const finalClassName = useMemo(() => {
      const baseClasses = "font-mono h-12 text-base";
      const mobileClasses = isMobile ? "text-lg" : ""; // Увеличиваем текст на мобильных
      return cn(baseClasses, mobileClasses, className);
    }, [className, isMobile]);

    return (
      <Input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="+7 (___) ___-__-__"
        className={finalClassName}
        autoComplete="tel"
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";