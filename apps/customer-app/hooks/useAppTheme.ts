import { getTheme, type Theme } from "@rapex/theme";

/**
 * Placeholder hook — always returns the light theme for now. Once ThemeContext
 * exists (Sprint FE-06), this reads the user's actual mode preference instead.
 */
export function useAppTheme(): Theme {
  return getTheme("light");
}
