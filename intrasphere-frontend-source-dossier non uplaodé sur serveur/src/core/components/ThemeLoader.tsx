import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { applyThemeToDOM } from "@/core/hooks/useTheme";
import { useAuth } from "@/core/hooks/useAuth";

interface UserSettings {
  colorScheme: string;
  theme: string;
  fontSize: string;
}

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Load user settings only if authenticated
  const { data: userSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) {
        if (response.status === 404) {
          // Return default settings if none exist
          return {
            colorScheme: 'purple',
            theme: 'light',
            fontSize: 'medium'
          };
        }
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply theme when settings are loaded
  useEffect(() => {
    if (userSettings) {
      applyThemeToDOM({
        colorScheme: userSettings.colorScheme || 'purple',
        theme: userSettings.theme || 'light',
        fontSize: userSettings.fontSize || 'medium'
      });
    } else if (!user) {
      // Apply default theme for non-authenticated users
      applyThemeToDOM({
        colorScheme: 'purple',
        theme: 'light',
        fontSize: 'medium'
      });
    }
  }, [userSettings, user]);

  return <>{children}</>;
}