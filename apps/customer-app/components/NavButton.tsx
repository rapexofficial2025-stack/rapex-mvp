import { Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type NavButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

/**
 * Minimal placeholder button so screens can demonstrate navigation before
 * the real Button component exists (Sprint FE-02). Gets replaced by
 * @rapex/ui-native's Button once that lands.
 */
export function NavButton({ label, onPress, variant = "primary" }: NavButtonProps) {
  const theme = useAppTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: isPrimary ? theme.colors.textInverse : theme.colors.textPrimary,
          fontSize: theme.typography.fontSize.base,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
  },
});
