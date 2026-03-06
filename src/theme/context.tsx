import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeColors {
  background: string;
  text: string;
  card: string;
  secondaryText: string;
  border: string;
  primary: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDarkMode: boolean;
}

const lightColors: ThemeColors = {
  background: '#f8f9fa',
  text: '#1a1a1a',
  card: '#ffffff',
  secondaryText: '#6b7280',
  border: '#e5e7eb',
  primary: '#4A90E2',
};

const darkColors: ThemeColors = {
  background: '#0a0a0a',
  text: '#ffffff',
  card: '#1a1a1a',
  secondaryText: '#a0a0a0',
  border: '#2a2a2a',
  primary: '#4A90E2',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
