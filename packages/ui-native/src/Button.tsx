import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { useTheme } from "./useTheme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, variant = "primary", size = "md", loading, disabled, ...pressableProps }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor: Record<ButtonVariant, string> = {
    primary: theme.colors.brandPrimary,
    secondary: theme.colors.surfaceAlt,
    outline: "transparent",
    danger: theme.colors.error,
  };

  const textColor: Record<ButtonVariant, string> = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.textPrimary,
    outline: theme.colors.brandPrimary,
    danger: theme.colors.textInverse,
  };

  const paddingVertical: Record<ButtonSize, number> = {
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  const fontSize: Record<ButtonSize, number> = {
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: backgroundColor[variant],
          borderColor: variant === "outline" ? theme.colors.brandPrimary : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
          borderRadius: theme.radius.md,
          paddingVertical: paddingVertical[size],
          paddingHorizontal: theme.spacing.lg,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <Text style={[styles.label, { color: textColor[variant], fontSize: fontSize[size] }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
  },
});
