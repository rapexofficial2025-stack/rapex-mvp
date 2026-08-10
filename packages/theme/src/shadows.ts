/**
 * Each level carries both a React Native shadow spec and a CSS box-shadow string,
 * so packages/ui-native and packages/ui-web can each pick the form they need
 * from the same source of truth.
 */
export type ShadowLevel = {
  native: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  css: string;
};

export const shadows: Record<"none" | "sm" | "md" | "lg" | "xl", ShadowLevel> = {
  none: {
    native: { shadowColor: "transparent", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    css: "none",
  },
  sm: {
    native: { shadowColor: "#000000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    css: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  md: {
    native: { shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
    css: "0 2px 6px rgba(0, 0, 0, 0.08)",
  },
  lg: {
    native: { shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
    css: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  xl: {
    native: { shadowColor: "#000000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12 },
    css: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },
};
