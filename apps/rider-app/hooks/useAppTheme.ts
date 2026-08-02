import { getTheme, type Theme } from "@rapex/theme";

/**
 * Placeholder hook — always returns the light theme for now. Once ThemeContext
 * exists, this reads the user's actual mode preference (dark mode ready) instead.
 */
export function useAppTheme(): Theme {
  return getTheme("light");
}
