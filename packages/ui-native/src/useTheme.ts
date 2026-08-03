import type { Theme } from "@rapex/theme";
import { useThemeContext } from "./ThemeProvider";

/** Single point of theme access for every component in this package -- reads the live mode from ThemeProvider. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}
