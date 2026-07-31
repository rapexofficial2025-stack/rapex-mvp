import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "./useTheme";
import { Button } from "./Button";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  retryLabel = "Try Again",
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing["3xl"], gap: theme.spacing.sm }]}>
      <Text
        style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: "700",
          color: theme.colors.error,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: theme.spacing.md, alignSelf: "stretch" }}>
          <Button label={retryLabel} variant="danger" onPress={onRetry} />
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
