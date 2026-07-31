/**
 * Placeholder palette pending official brand guidelines (see docs/brand-guidelines/README.md).
 * Swap these values once the brand is finalized — nothing else in the app should change,
 * since every component consumes the semantic tokens below, not raw hex values.
 */

export const primitive = {
  purple50: "#F5F3FF",
  purple100: "#EDE9FE",
  purple300: "#C4B5FD",
  purple500: "#8B5CF6",
  purple700: "#6D28D9",
  purple900: "#4C1D95",

  teal50: "#F0FDFA",
  teal300: "#5EEAD4",
  teal500: "#14B8A6",
  teal700: "#0F766E",

  neutral0: "#FFFFFF",
  neutral50: "#F9FAFB",
  neutral100: "#F3F4F6",
  neutral200: "#E5E7EB",
  neutral300: "#D1D5DB",
  neutral400: "#9CA3AF",
  neutral500: "#6B7280",
  neutral600: "#4B5563",
  neutral700: "#374151",
  neutral800: "#1F2937",
  neutral900: "#111827",
  neutral950: "#030712",

  red500: "#EF4444",
  red700: "#B91C1C",
  amber500: "#F59E0B",
  amber700: "#B45309",
  green500: "#22C55E",
  green700: "#15803D",
  blue500: "#3B82F6",
  blue700: "#1D4ED8",
} as const;

export const semanticLight = {
  background: primitive.neutral50,
  surface: primitive.neutral0,
  surfaceAlt: primitive.neutral100,
  border: primitive.neutral200,

  textPrimary: primitive.neutral900,
  textSecondary: primitive.neutral600,
  textInverse: primitive.neutral0,
  textDisabled: primitive.neutral400,

  brandPrimary: primitive.purple500,
  brandPrimaryHover: primitive.purple700,
  brandSecondary: primitive.teal500,

  success: primitive.green500,
  successStrong: primitive.green700,
  warning: primitive.amber500,
  warningStrong: primitive.amber700,
  error: primitive.red500,
  errorStrong: primitive.red700,
  info: primitive.blue500,
  infoStrong: primitive.blue700,

  overlay: "rgba(17, 24, 39, 0.5)",
} as const;

export const semanticDark = {
  background: primitive.neutral950,
  surface: primitive.neutral900,
  surfaceAlt: primitive.neutral800,
  border: primitive.neutral700,

  textPrimary: primitive.neutral0,
  textSecondary: primitive.neutral300,
  textInverse: primitive.neutral900,
  textDisabled: primitive.neutral600,

  brandPrimary: primitive.purple300,
  brandPrimaryHover: primitive.purple500,
  brandSecondary: primitive.teal300,

  success: primitive.green500,
  successStrong: primitive.green700,
  warning: primitive.amber500,
  warningStrong: primitive.amber700,
  error: primitive.red500,
  errorStrong: primitive.red700,
  info: primitive.blue500,
  infoStrong: primitive.blue700,

  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type SemanticColors = { [K in keyof typeof semanticLight]: string };

export const colors: { light: SemanticColors; dark: SemanticColors } = {
  light: semanticLight,
  dark: semanticDark,
};
