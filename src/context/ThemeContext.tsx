import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine if dark mode should be active
      const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
      
      // Apply theme class and save preference
      if (shouldBeDark) {
        root.classList.add('dark');
        setIsDarkMode(true);
      } else {
        root.classList.remove('dark');
        setIsDarkMode(false);
      }
      
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
      
      // Apply theme-specific CSS variables for better contrast
      if (shouldBeDark) {
        // Dark mode variables
        root.style.setProperty('--bg-primary', '#121212');
        root.style.setProperty('--bg-secondary', '#1e1e1e');
        root.style.setProperty('--bg-tertiary', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#e0e0e0');
        root.style.setProperty('--text-tertiary', '#a0a0a0');
        root.style.setProperty('--border-color', '#3a3a3a');
        root.style.setProperty('--card-bg', '#1e1e1e');
        root.style.setProperty('--input-bg', '#2d2d2d');
        root.style.setProperty('--input-text', '#ffffff');
        root.style.setProperty('--input-border', '#3a3a3a');
        root.style.setProperty('--input-placeholder', '#6e6e6e');
        root.style.setProperty('--button-hover', '#3a3a3a');
      } else {
        // Light mode variables
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8fafc');
        root.style.setProperty('--bg-tertiary', '#f1f5f9');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#475569');
        root.style.setProperty('--text-tertiary', '#64748b');
        root.style.setProperty('--border-color', '#e2e8f0');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--input-bg', '#ffffff');
        root.style.setProperty('--input-text', '#1e293b');
        root.style.setProperty('--input-border', '#cbd5e1');
        root.style.setProperty('--input-placeholder', '#94a3b8');
        root.style.setProperty('--button-hover', '#f1f5f9');
      }
      
      // Listen for system theme changes if using system theme
      if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
          const newShouldBeDark = e.matches;
          if (newShouldBeDark) {
            root.classList.add('dark');
            setIsDarkMode(true);
          } else {
            root.classList.remove('dark');
            setIsDarkMode(false);
          }
          
          // Update CSS variables when system theme changes
          if (newShouldBeDark) {
            // Dark mode variables
            root.style.setProperty('--bg-primary', '#121212');
            root.style.setProperty('--bg-secondary', '#1e1e1e');
            root.style.setProperty('--bg-tertiary', '#2d2d2d');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#e0e0e0');
            root.style.setProperty('--text-tertiary', '#a0a0a0');
            root.style.setProperty('--border-color', '#3a3a3a');
            root.style.setProperty('--card-bg', '#1e1e1e');
            root.style.setProperty('--input-bg', '#2d2d2d');
            root.style.setProperty('--input-text', '#ffffff');
            root.style.setProperty('--input-border', '#3a3a3a');
            root.style.setProperty('--input-placeholder', '#6e6e6e');
            root.style.setProperty('--button-hover', '#3a3a3a');
          } else {
            // Light mode variables
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--bg-tertiary', '#f1f5f9');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#475569');
            root.style.setProperty('--text-tertiary', '#64748b');
            root.style.setProperty('--border-color', '#e2e8f0');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--input-text', '#1e293b');
            root.style.setProperty('--input-border', '#cbd5e1');
            root.style.setProperty('--input-placeholder', '#94a3b8');
            root.style.setProperty('--button-hover', '#f1f5f9');
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 