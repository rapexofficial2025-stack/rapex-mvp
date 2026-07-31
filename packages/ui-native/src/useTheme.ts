import { getTheme, type Theme } from "@rapex/theme";

/**
 * Single point of theme access for every component in this package. Hardcoded
 * to light mode until the app-level ThemeContext exists (Sprint FE-06) --
 * swap the implementation here once it does, no component call sites change.
 */
export function useTheme(): Theme {
  return getTheme("light");
}
