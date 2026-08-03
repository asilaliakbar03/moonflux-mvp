'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────
   MoonFluxx Theme Engine
   Supports: 'dark' (default) | 'light'
   Persistence: localStorage('moonflux-theme')
   Fallback: prefers-color-scheme media query
   ──────────────────────────────────────────────────────────── */

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or system preference (runs once)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('moonflux-theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setThemeState('light');
      }
    } catch {
      // localStorage unavailable — stay dark
    }
  }, []);

  // Sync <html> class and localStorage whenever theme changes
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem('moonflux-theme', theme);
    } catch {
      // Silently ignore
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
