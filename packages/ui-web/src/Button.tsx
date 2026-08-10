import type { ButtonHTMLAttributes } from "react";
import { useTheme } from "./useTheme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ label, variant = "primary", size = "md", loading, disabled, ...buttonProps }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor: Record<ButtonVariant, string> = {
    primary: theme.colors.brandPrimary,
    secondary: theme.colors.surfaceAlt,
    outline: "transparent",
    danger: theme.colors.error,
  };

  const color: Record<ButtonVariant, string> = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.textPrimary,
    outline: theme.colors.brandPrimary,
    danger: theme.colors.textInverse,
  };

  const padding: Record<ButtonSize, string> = {
    sm: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    md: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
    lg: `${theme.spacing.md}px ${theme.spacing.xl}px`,
  };

  const fontSize: Record<ButtonSize, number> = {
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg,
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      style={{
        backgroundColor: backgroundColor[variant],
        color: color[variant],
        border: variant === "outline" ? `1px solid ${theme.colors.brandPrimary}` : "none",
        borderRadius: theme.radius.md,
        padding: padding[size],
        fontSize: fontSize[size],
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
      }}
      {...buttonProps}
    >
      {loading ? "…" : label}
    </button>
  );
}
