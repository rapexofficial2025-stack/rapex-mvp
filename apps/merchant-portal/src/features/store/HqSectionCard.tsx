import type { ReactNode } from "react";
import { useTheme } from "@rapex/ui-web";
import { HQ_COLOR_HEX, hqContentBg, hqTitleBg, type HqColorKey } from "./hqColors";

type HqSectionCardProps = {
  emoji: string;
  title: string;
  color: HqColorKey;
  right?: ReactNode;
  children: ReactNode;
};

export function HqSectionCard({ emoji, title, color, right, children }: HqSectionCardProps) {
  const theme = useTheme();

  return (
    <section
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius["2xl"],
        boxShadow: theme.shadows.md.css,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.md,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
          backgroundColor: hqTitleBg(color),
          padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
          borderRadius: theme.radius.lg,
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: theme.spacing.xs }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{ fontSize: theme.typography.fontSize.base, fontWeight: 700, color: HQ_COLOR_HEX[color] }}>{title}</span>
        </div>
        {right}
      </div>

      <div
        style={{
          backgroundColor: hqContentBg(color),
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function hqAccentColor(color: HqColorKey): string {
  return HQ_COLOR_HEX[color];
}
