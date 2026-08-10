import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./useTheme";

export type LoadingProps = {
  label?: string;
};

export function Loading({ label }: LoadingProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { gap: theme.spacing.sm }]}>
      <ActivityIndicator color={theme.colors.brandPrimary} size="large" />
      {label ? (
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
