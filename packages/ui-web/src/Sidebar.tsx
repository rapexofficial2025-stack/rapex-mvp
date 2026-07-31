import type { ReactNode } from "react";
import { useTheme } from "./useTheme";

export type SidebarItem = {
  key: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export type SidebarProps = {
  title: string;
  items: SidebarItem[];
  footer?: ReactNode;
};

export function Sidebar({ title, items, footer }: SidebarProps) {
  const theme = useTheme();

  return (
    <nav
      style={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: theme.colors.surface,
        borderRight: `1px solid ${theme.colors.border}`,
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing.lg,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: 700,
          color: theme.colors.brandPrimary,
          marginBottom: theme.spacing.xl,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs, flex: 1 }}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            style={{
              textAlign: "left",
              border: "none",
              borderRadius: theme.radius.md,
              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
              backgroundColor: item.active ? theme.colors.brandPrimary : "transparent",
              color: item.active ? theme.colors.textInverse : theme.colors.textPrimary,
              fontSize: theme.typography.fontSize.base,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {footer ? <div style={{ marginTop: theme.spacing.lg }}>{footer}</div> : null}
    </nav>
  );
}
