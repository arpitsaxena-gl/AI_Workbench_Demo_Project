import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';

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
  toggleTheme: () => void;
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--background',
      isDarkMode ? darkColors.background : lightColors.background,
    );
    document.documentElement.style.setProperty(
      '--text',
      isDarkMode ? darkColors.text : lightColors.text,
    );
    document.documentElement.style.setProperty(
      '--card',
      isDarkMode ? darkColors.card : lightColors.card,
    );
    document.documentElement.style.setProperty(
      '--secondary-text',
      isDarkMode ? darkColors.secondaryText : lightColors.secondaryText,
    );
    document.documentElement.style.setProperty(
      '--border',
      isDarkMode ? darkColors.border : lightColors.border,
    );
    document.body.style.backgroundColor = isDarkMode
      ? darkColors.background
      : lightColors.background;
    document.body.style.color = isDarkMode ? darkColors.text : lightColors.text;
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
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
