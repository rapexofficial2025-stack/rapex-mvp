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
  orange300: "#FDBA74",
  orange500: "#F97316",
  orange700: "#C2410C",

  // Requested for the RAPEX design system but never previously defined
  // anywhere in code or docs/brand-guidelines (which is itself still an
  // empty placeholder) -- same "placeholder pending official brand
  // guidelines" status as the rest of this file, chosen as reasonable
  // complements to the existing purple/orange pair rather than invented
  // from nothing. Swap when real brand hex values exist.
  lavender100: "#EDE7FB",
  lavender300: "#D6C9F5",
  lavender500: "#B39DDB",
  lavender700: "#8A6FC2",

  peach100: "#FFE9DC",
  peach300: "#FFCBAB",
  peach500: "#FFA873",

  pink300: "#F9A8D4",
  pink500: "#EC4899",
  pink700: "#BE185D",
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
  accent: primitive.orange500,
  accentHover: primitive.orange700,

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
  accent: primitive.orange300,
  accentHover: primitive.orange500,

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

/**
 * Extended accent palette (lavender/peach/pink) -- not mapped to a semantic
 * role like the tokens above, since no screen has assigned them a purpose
 * yet. Available for decorative use (gradients, ambient glow, illustration
 * accents) without inventing what role they "should" play. Same
 * light/dark shape as `colors` for consistency, though light and dark
 * currently share the same values -- split if a real need for
 * mode-specific variants comes up.
 */
export type ExtendedColors = { lavender: string; peach: string; pink: string };

export const extended: { light: ExtendedColors; dark: ExtendedColors } = {
  light: { lavender: primitive.lavender500, peach: primitive.peach500, pink: primitive.pink500 },
  dark: { lavender: primitive.lavender300, peach: primitive.peach300, pink: primitive.pink300 },
};
