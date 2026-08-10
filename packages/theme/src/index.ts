import { colors, extended, primitive, type ExtendedColors, type SemanticColors } from "./colors";
import { typography } from "./typography";
import { spacing, radius } from "./spacing";
import { shadows } from "./shadows";
import { glass } from "./glass";

export { colors, extended, primitive, typography, spacing, radius, shadows, glass };
export type { ExtendedColors, SemanticColors };

export type ThemeMode = "light" | "dark";

export type Theme = {
  mode: ThemeMode;
  colors: SemanticColors;
  extended: ExtendedColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  glass: typeof glass.light;
};

export function getTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: colors[mode],
    extended: extended[mode],
    typography,
    spacing,
    radius,
    shadows,
    glass: glass[mode],
  };
}

export const lightTheme = getTheme("light");
export const darkTheme = getTheme("dark");
