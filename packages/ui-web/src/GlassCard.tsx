import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "./useTheme";

export type GlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

// Floating glass look per founder instruction (2026-08-20): glass surfaces
// get a more pronounced 35%-opacity shadow than theme.shadows.md's default
// 8% -- a deliberate override for this component only, not a change to the
// shared shadow scale (which other, non-glass components still rely on).
const GLASS_SHADOW = "0 8px 24px rgba(0, 0, 0, 0.35)";

export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.glass.background,
        border: `1px solid ${theme.glass.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        boxShadow: GLASS_SHADOW,
        backdropFilter: theme.glass.backdropFilter,
        WebkitBackdropFilter: theme.glass.backdropFilter,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
