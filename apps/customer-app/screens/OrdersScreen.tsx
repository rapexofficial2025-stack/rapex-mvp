import { FlatList, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { formatPeso, formatDateTime } from "@rapex/utils";
import { useMyOrders, type OrderSummary } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { GradientScreenBackground } from "../components/GradientScreenBackground";

type Props = NativeStackScreenProps<RootStackParamList, "Orders">;

const STATUS_TONE: Record<OrderSummary["status"], "success" | "warning" | "error" | "info" | "neutral" | "brand"> = {
  pending: "warning",
  accepted: "info",
  preparing: "info",
  ready: "info",
  delivering: "brand",
  completed: "success",
  cancelled: "error",
};

export function OrdersScreen({ navigation }: Props) {
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
          <View style={{ marginBottom: theme.spacing.sm, gap: theme.spacing.xxs }}>
            <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
              Orders
            </Text>
            <Badge label="Mock data — no confirmed order-list endpoint yet" tone="warning" />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
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
          </Pressable>
        )}
      />
    </View>
  );
}
