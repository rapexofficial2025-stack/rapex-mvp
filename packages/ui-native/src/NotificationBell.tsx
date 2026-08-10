import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./useTheme";

export type NotificationBellProps = {
  count?: number;
  onPress?: () => void;
};

export function NotificationBell({ count = 0, onPress }: NotificationBellProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.full,
          padding: theme.spacing.sm,
        },
      ]}
    >
      <Text style={{ fontSize: theme.typography.fontSize.lg }}>🔔</Text>
      {count > 0 ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.error,
              borderColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={{ color: theme.colors.textInverse, fontSize: 10, fontWeight: "700" }}>
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
});
