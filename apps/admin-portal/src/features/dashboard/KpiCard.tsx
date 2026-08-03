import type { ReactNode } from "react";
import { useTheme } from "@rapex/ui-web";

export function KpiCard({
  icon,
  label,
  value,
  changePercent,
  accentColor,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  changePercent?: number;
  accentColor: string;
}) {
  const theme = useTheme();
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xs,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.radius.md,
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: theme.typography.fontSize.lg,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</div>
      <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: 700, color: theme.colors.textPrimary }}>{value}</div>
      {changePercent !== undefined ? (
        <div style={{ fontSize: theme.typography.fontSize.xs, color: isPositive ? theme.colors.success : theme.colors.error }}>
          {isPositive ? "↑" : "↓"} {Math.abs(changePercent).toFixed(1)}% vs yesterday
        </div>
      ) : null}
    </div>
  );
}
