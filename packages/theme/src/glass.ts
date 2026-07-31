/**
 * Tokens for the "glass" surface style referenced across RAPEX's component list
 * (glass design components). RN implementations use `tint`/`intensity` with a blur
 * view (e.g. expo-blur); web implementations use `backdropFilter` with `background`.
 */
export type GlassTokens = {
  background: string;
  border: string;
  blurIntensity: number;
  backdropFilter: string;
};

export const glass: { light: GlassTokens; dark: GlassTokens } = {
  light: {
    background: "rgba(255, 255, 255, 0.6)",
    border: "rgba(255, 255, 255, 0.3)",
    blurIntensity: 40,
    backdropFilter: "blur(20px)",
  },
  dark: {
    background: "rgba(17, 24, 39, 0.55)",
    border: "rgba(255, 255, 255, 0.08)",
    blurIntensity: 40,
    backdropFilter: "blur(20px)",
  },
};
