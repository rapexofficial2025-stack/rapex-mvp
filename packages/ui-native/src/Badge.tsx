import { StyleSheet, Text, View } from "react-native";
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

  const textColor: Record<BadgeTone, string> = {
    neutral: theme.colors.textPrimary,
    success: theme.colors.textInverse,
    warning: theme.colors.textInverse,
    error: theme.colors.textInverse,
    info: theme.colors.textInverse,
    brand: theme.colors.textInverse,
    accent: theme.colors.textInverse,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: backgroundColor[tone],
          borderRadius: theme.radius.full,
          paddingVertical: theme.spacing.xxs,
          paddingHorizontal: theme.spacing.sm,
        },
      ]}
    >
      <Text style={{ color: textColor[tone], fontSize: theme.typography.fontSize.xs, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
});
