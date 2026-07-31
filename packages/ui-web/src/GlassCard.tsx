import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "./useTheme";

export type GlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.glass.background,
        border: `1px solid ${theme.glass.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.md.css,
        backdropFilter: theme.glass.backdropFilter,
        WebkitBackdropFilter: theme.glass.backdropFilter,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
