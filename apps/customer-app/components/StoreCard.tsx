import { Pressable, Text, View } from "react-native";
import { Badge } from "@rapex/ui-native";
import type { StoreSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

type StoreCardProps = {
  store: StoreSummary;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function StoreCard({ store, onPress, isFavorite, onToggleFavorite }: StoreCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary }}>
          {store.name}
        </Text>
        <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          {store.category} · {store.distanceLabel} · {store.rating} ⭐ · {store.deliveryTimeLabel}
        </Text>
      </View>
      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} hitSlop={8}>
          <Text style={{ fontSize: theme.typography.fontSize.lg, color: isFavorite ? theme.colors.accent : theme.colors.textDisabled }}>
            {isFavorite ? "★" : "☆"}
          </Text>
        </Pressable>
      ) : null}
      <Badge label={store.isOpen ? "Open" : "Closed"} tone={store.isOpen ? "success" : "neutral"} />
    </Pressable>
  );
}
