import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKENS, type Tokens } from './tokens';

export type Theme = 'light' | 'dark';

type ThemeCtx = { theme: Theme; t: Tokens; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<ThemeCtx>({ theme: 'light', t: TOKENS.light, setTheme: () => {}, toggle: () => {} });

const KEY = 'rea-theme';

function initial(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initial);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', TOKENS[theme].paper);
    const id = window.setTimeout(() => root.classList.remove('theme-switching'), 420);
    return () => window.clearTimeout(id);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, t: TOKENS[theme] as Tokens, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }),
    [theme, setTheme]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
