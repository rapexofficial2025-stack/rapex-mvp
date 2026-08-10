import { FlatList, Text, View } from "react-native";
import { Badge, Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { formatPeso, formatDateTime } from "@rapex/utils";
import { useMyOrders, type OrderSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";
import { GradientScreenBackground } from "../components/GradientScreenBackground";

const STATUS_TONE: Record<OrderSummary["status"], "success" | "warning" | "error" | "info" | "neutral" | "brand"> = {
  pending: "warning",
  accepted: "info",
  preparing: "info",
  ready: "info",
  delivering: "brand",
  completed: "success",
  cancelled: "error",
};

export function OrdersScreen() {
  const theme = useAppTheme();
  const { data: orders, loading, error, refetch } = useMyOrders();

  if (loading) return <Loading label="Loading orders…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!orders || orders.length === 0) return <EmptyState title="No orders yet" description="Your orders will show up here." />;

  return (
    <View style={{ flex: 1 }}>
      <GradientScreenBackground />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        ListHeaderComponent={
          <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary, marginBottom: theme.spacing.sm }}>
            Orders
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              gap: theme.spacing.xxs,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary }}>
                {item.storeName}
              </Text>
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </View>
            <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              {item.itemCount} item{item.itemCount === 1 ? "" : "s"} · {formatDateTime(item.placedAt)}
            </Text>
            <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "600", color: theme.colors.textPrimary }}>
              {formatPeso(item.total)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
