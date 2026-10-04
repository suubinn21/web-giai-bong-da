'use client';

import { useState, useEffect } from 'react';
import { getTheme, toggleTheme, setTheme, ThemeMode } from './theme';

export function useTheme() {
  const [theme, setLocalTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    // Sync initial theme
    const current = getTheme();
    setLocalTheme(current);
    if (current === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      setLocalTheme(customEvent.detail || getTheme());
    };

    window.addEventListener('itftms_theme_change', handler);
    return () => window.removeEventListener('itftms_theme_change', handler);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme: () => {
      const next = toggleTheme();
      setLocalTheme(next);
      return next;
    },
    setTheme: (t: ThemeMode) => {
      setTheme(t);
      setLocalTheme(t);
    },
  };
}
