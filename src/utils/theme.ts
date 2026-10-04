export type ThemeMode = 'light' | 'dark';

export const getTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('itftms_theme') as ThemeMode | null;
  return saved === 'dark' ? 'dark' : 'light';
};

export const setTheme = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('itftms_theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  window.dispatchEvent(new CustomEvent('itftms_theme_change', { detail: theme }));
};

export const toggleTheme = (): ThemeMode => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};
