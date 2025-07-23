import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// Note: Using fetch directly as apiRequest may not be available in all contexts
import { initializeColorScheme, applyColorScheme, type ColorSchemeName } from '@shared/color-palette';

interface ColorSchemeData {
  currentScheme: ColorSchemeName;
  schemeData: any;
  availableSchemes: Array<{
    key: ColorSchemeName;
    name: string;
    description: string;
  }>;
}

export function useColorScheme() {
  // Fetch current color scheme from server
  const { data: colorSchemeData, isLoading } = useQuery<ColorSchemeData>({
    queryKey: ['/api/color-scheme'],
    queryFn: async () => {
      const response = await fetch('/api/color-scheme');
      if (!response.ok) throw new Error('Failed to fetch color scheme');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Initialize color scheme on app load
  useEffect(() => {
    if (colorSchemeData?.currentScheme) {
      // Apply the server-stored color scheme
      applyColorScheme(colorSchemeData.currentScheme);
    } else {
      // Fallback to localStorage or default
      initializeColorScheme();
    }
  }, [colorSchemeData?.currentScheme]);

  return {
    currentScheme: colorSchemeData?.currentScheme,
    availableSchemes: colorSchemeData?.availableSchemes,
    isLoading,
  };
}