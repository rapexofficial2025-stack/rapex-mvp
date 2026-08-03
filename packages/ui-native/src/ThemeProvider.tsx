import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { getTheme, type Theme, type ThemeMode } from "@rapex/theme";

const STORAGE_KEY = "rapex-theme-mode";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  /** When set, the app ignores system preference and persisted overrides -- always renders this mode. Temporary escape hatch for screens/apps not yet designed for both modes. */
  forceMode?: ThemeMode;
};

export function ThemeProvider({ children, forceMode }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [explicitMode, setExplicitMode] = useState<ThemeMode | null>(null);

  // Load a persisted override once on mount; until then (and if none exists), follow the OS setting live.
  useEffect(() => {
    if (forceMode) return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!cancelled && (stored === "light" || stored === "dark")) setExplicitMode(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [forceMode]);

  const mode: ThemeMode = forceMode ?? explicitMode ?? (systemScheme === "dark" ? "dark" : "light");

  const setMode = (next: ThemeMode) => {
    if (forceMode) return;
    setExplicitMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
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
