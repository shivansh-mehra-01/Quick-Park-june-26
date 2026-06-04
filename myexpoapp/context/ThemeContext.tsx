import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  card: 'white',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#f1f5f9',
  primary: '#3b82f6',
  success: '#16a34a',
  warning: '#fbbf24',
  danger: '#ef4444',
  tabBar: '#ffffff',
};

export const darkColors: ThemeColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#f87171',
  tabBar: '#1e293b',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('app_theme');
        if (storedTheme === 'dark') {
          setTheme('dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await SecureStore.setItemAsync('app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  if (!isLoaded) return null; // Avoid flicker

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
