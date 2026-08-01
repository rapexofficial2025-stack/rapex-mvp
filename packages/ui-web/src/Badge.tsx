import { useTheme } from "./useTheme";

export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info" | "brand" | "accent";

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const theme = useTheme();

  const backgroundColor: Record<BadgeTone, string> = {
    neutral: theme.colors.surfaceAlt,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
    brand: theme.colors.brandPrimary,
    accent: theme.colors.accent,
  };

  const color: Record<BadgeTone, string> = {
    neutral: theme.colors.textPrimary,
    success: theme.colors.textInverse,
    warning: theme.colors.textInverse,
    error: theme.colors.textInverse,
    info: theme.colors.textInverse,
    brand: theme.colors.textInverse,
    accent: theme.colors.textInverse,
  };

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: backgroundColor[tone],
        color: color[tone],
        borderRadius: theme.radius.full,
        padding: `${theme.spacing.xxs}px ${theme.spacing.sm}px`,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
