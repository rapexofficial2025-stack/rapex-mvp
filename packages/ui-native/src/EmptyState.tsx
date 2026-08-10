import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "./useTheme";
import { Button } from "./Button";

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing["3xl"], gap: theme.spacing.sm }]}>
      <Text
        style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: "700",
          color: theme.colors.textPrimary,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.md, alignSelf: "stretch" }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
