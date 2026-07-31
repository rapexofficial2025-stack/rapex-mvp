import type { ReactNode } from "react";
import { useTheme } from "./useTheme";

export type TopbarProps = {
  title: string;
  actions?: ReactNode;
};

export function Topbar({ title, actions }: TopbarProps) {
  const theme = useTheme();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
      }}
    >
      <h1 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>{title}</h1>
      {actions ? <div style={{ display: "flex", gap: theme.spacing.sm }}>{actions}</div> : null}
    </header>
  );
}
