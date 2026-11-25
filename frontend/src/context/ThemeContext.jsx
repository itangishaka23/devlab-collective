import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });
const KEY = 'devlab_theme';

const initial = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage blocked */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme); // our own overrides
    root.setAttribute('data-bs-theme', theme); // Bootstrap 5.3 built-in dark mode
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
