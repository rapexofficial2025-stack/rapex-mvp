import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getTheme, type Theme, type ThemeMode } from "@rapex/theme";

const STORAGE_KEY = "rapex-theme-mode";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
}

function readStoredMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function ThemeProvider({ children, defaultMode }: { children: ReactNode; defaultMode?: ThemeMode }) {
  const [hasExplicitPreference, setHasExplicitPreference] = useState(() => readStoredMode() !== null);
  const [mode, setModeState] = useState<ThemeMode>(
    () => readStoredMode() ?? defaultMode ?? (systemPrefersDark() ? "dark" : "light"),
  );

  // Follow OS-level changes live, but only until the user makes an explicit choice.
  useEffect(() => {
    if (hasExplicitPreference || typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setModeState(e.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [hasExplicitPreference]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    setHasExplicitPreference(true);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleMode = () => setMode(mode === "light" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(() => ({ theme: getTheme(mode), mode, setMode, toggleMode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme/useThemeMode must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeMode(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void; toggleMode: () => void } {
  const { mode, setMode, toggleMode } = useThemeContext();
  return { mode, setMode, toggleMode };
}
