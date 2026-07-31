import { useState, type InputHTMLAttributes } from "react";
import { useTheme } from "./useTheme";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  label?: string;
  errorMessage?: string;
};

export function Input({ label, errorMessage, onFocus, onBlur, ...inputProps }: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = errorMessage ? theme.colors.error : isFocused ? theme.colors.brandPrimary : theme.colors.border;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
      {label ? (
        <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{label}</label>
      ) : null}
      <input
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: theme.radius.md,
          padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
          fontFamily: "inherit",
          outline: "none",
        }}
        {...inputProps}
      />
      {errorMessage ? (
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.error }}>{errorMessage}</span>
      ) : null}
    </div>
  );
}
