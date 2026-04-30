import { createContext, useContext, useState } from 'react';

export const ThemeCtx = createContext('dark');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
