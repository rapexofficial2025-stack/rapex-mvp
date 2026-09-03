import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, ErrorState, Loading, EmptyState } from "@rapex/ui-native";
import { formatPeso, formatDateTime } from "@rapex/utils";
import { useAsync, useRepositories, type OrderStatus } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

const STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "delivering", label: "On the way" },
  { key: "completed", label: "Delivered" },
] as const;

/** Which step index a real OrderStatus has reached, for the visual stepper below. */
function stepIndexFor(status: OrderStatus): number {
  switch (status) {
    case "pending":
    case "accepted":
      return 0;
    case "preparing":
    case "ready":
      return 1;
    case "delivering":
      return 2;
    case "completed":
      return 3;
    case "cancelled":
      return -1;
  }
}

export function OrderTrackingScreen({ route }: Props) {
  const theme = useAppTheme();
  const { orders } = useRepositories();
  const { data: order, loading, error, refetch } = useAsync(() => orders.getOrderById(route.params.orderId), [route.params.orderId]);

  if (loading) return <Loading label="Loading order…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!order) return <EmptyState title="Order not found" />;

  const currentStep = stepIndexFor(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <ScreenContainer title={`Order · ${order.storeName}`} subtitle={formatDateTime(order.placedAt)}>
      <Badge label="Mock data — no confirmed order-detail endpoint yet" tone="warning" />

      {isCancelled ? (
        <Badge label="This order was cancelled" tone="error" />
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: theme.spacing.sm }}>
          {STEPS.map((step, index) => {
            const reached = index <= currentStep;
            return (
              <View key={step.key} style={{ flex: 1, alignItems: "center" }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: reached ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: reached ? theme.colors.brandPrimary : theme.colors.border,
                  }}
                >
                  <Text style={{ color: reached ? theme.colors.textInverse : theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, fontWeight: "700" }}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: theme.typography.fontSize.xs,
                    color: reached ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontWeight: reached ? "700" : "400",
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 1, backgroundColor: theme.colors.border, marginTop: theme.spacing.md }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Items</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>
          {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Total</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>{formatPeso(order.total)}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Status</Text>
        <Badge label={order.status} tone={isCancelled ? "error" : "info"} />
      </View>

      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.md }}>
        Line-item detail, assigned rider, and live status updates need a confirmed Xano order-detail endpoint — not available yet.
      </Text>
    </ScreenContainer>
  );
}
