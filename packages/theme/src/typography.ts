/**
 * Font family names are placeholders — actual font files live in assets/fonts (per app,
 * loaded via expo-font for RN / @font-face for web) once the brand typeface is chosen.
 */
export const fontFamily = {
  regular: "System",
  medium: "System",
  semibold: "System",
  bold: "System",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  "2xl": 32,
  "3xl": 38,
  "4xl": 44,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
} as const;
