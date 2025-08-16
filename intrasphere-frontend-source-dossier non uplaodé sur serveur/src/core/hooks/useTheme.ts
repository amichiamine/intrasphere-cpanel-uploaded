import { useEffect } from "react";

interface ThemeSettings {
  colorScheme?: string;
  theme?: string;
  fontSize?: string;
}

// Global theme utility functions
const colorMap: Record<string, { primary: string; secondary: string }> = {
  purple: { primary: '#8B5CF6', secondary: '#A78BFA' },
  blue: { primary: '#3B82F6', secondary: '#60A5FA' },
  green: { primary: '#10B981', secondary: '#34D399' },
  orange: { primary: '#F97316', secondary: '#FB923C' },
  red: { primary: '#EF4444', secondary: '#F87171' }
};

const convertToHsl = (hex: string) => {
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const applyThemeToDOM = (settings: ThemeSettings) => {
  const {
    colorScheme = 'purple',
    theme = 'light',
    fontSize = 'medium'
  } = settings;
  
  const root = document.documentElement;
  
  // Apply color scheme
  const colors = colorMap[colorScheme];
  if (colors) {
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--primary', convertToHsl(colors.primary));
    root.style.setProperty('--ring', convertToHsl(colors.primary));
    
    console.log('Theme applied:', colors);
  }
  
  // Apply theme mode
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  
  // Apply font size
  const fontSizeMap: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };
  root.style.setProperty('--base-font-size', fontSizeMap[fontSize] || '16px');
};

export const useTheme = (settings: ThemeSettings = {}) => {
  useEffect(() => {
    // Only apply default theme if no settings are provided
    if (Object.keys(settings).length === 0) {
      applyThemeToDOM({
        colorScheme: 'purple',
        theme: 'light',
        fontSize: 'medium'
      });
    } else {
      applyThemeToDOM(settings);
    }
  }, [settings.colorScheme, settings.theme, settings.fontSize]);
};