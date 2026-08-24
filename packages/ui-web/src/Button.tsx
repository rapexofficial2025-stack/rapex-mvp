import { useState, type ButtonHTMLAttributes } from "react";
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
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);

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

  // Floating look per founder instruction (2026-08-20): every button gets a
  // drop shadow, strongest on the main/primary category, lighter on
  // secondary/danger, and none on outline (a bordered, flat control by
  // design -- a shadow there would fight its own "flat" affordance).
  const boxShadow: Record<ButtonVariant, string> = {
    primary: "0 6px 16px rgba(0, 0, 0, 0.22)",
    secondary: "0 3px 10px rgba(0, 0, 0, 0.12)",
    outline: "none",
    danger: "0 4px 12px rgba(0, 0, 0, 0.18)",
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={release}
      onMouseLeave={release}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={release}
      onTouchCancel={release}
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
        boxShadow: isDisabled ? "none" : boxShadow[variant],
        // Press feedback per founder reference (docs/design/button-reference.md):
        // scales down on press so the interaction is visible, springs back on release.
        transform: pressed && !isDisabled ? "scale(0.9)" : "scale(1)",
        transition: "transform 100ms ease",
      }}
      {...buttonProps}
    >
      {loading ? "…" : label}
    </button>
  );
}
