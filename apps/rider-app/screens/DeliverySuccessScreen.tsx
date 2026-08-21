import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import { useRepositories, type OrderFinancials } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "DeliverySuccess">;

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: theme.spacing.xxs }}>
      <Text style={{ color: theme.colors.textSecondary }}>{label}</Text>
      <Text
        style={{
          color: emphasis ? theme.colors.success : theme.colors.textPrimary,
          fontWeight: emphasis ? "700" : "600",
          fontSize: emphasis ? theme.typography.fontSize.lg : theme.typography.fontSize.base,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function DeliverySuccessScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { delivery } = useRepositories();
  const [financials, setFinancials] = useState<OrderFinancials | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    delivery!
      .getOrderFinancials(route.params.orderId)
      .then(setFinancials)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load order financials."));
  }, [delivery, route.params.orderId]);

  if (error) return <ErrorState description={error} />;
  if (financials === undefined) return <Loading label="Settling order…" />;

  return (
    <ScreenContainer title="Delivery Completed" subtitle={`Order #${route.params.orderId}`}>
      <GlassCard style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 48 }}>✅</Text>
        <Text style={{ color: theme.colors.success, fontWeight: "700", fontSize: theme.typography.fontSize.xl, marginTop: theme.spacing.sm }}>
          Order Completed
        </Text>
      </GlassCard>

      {financials ? (
        <GlassCard>
          <Row label="Product Total" value={formatPeso(financials.productTotal)} />
          <Row label="Delivery Fee" value={formatPeso(financials.deliveryFee)} />
          {financials.platformFee > 0 ? <Row label="Platform Fee" value={formatPeso(financials.platformFee)} /> : null}
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.xs }} />
          <Row label="Customer Wallet Deducted" value={formatPeso(financials.walletDeduction)} />
          <Row label="Merchant Receives" value={formatPeso(financials.merchantReceives)} />
          <Row label="Platform Revenue" value={formatPeso(financials.platformRevenue)} />
          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.xs }} />
          <Row label="Your Earnings" value={formatPeso(financials.riderEarnings)} emphasis />
        </GlassCard>
      ) : (
        <ErrorState description="Settlement record not found for this order." />
      )}

      <GlassCard>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginBottom: theme.spacing.xs }}>
          🖨️ Print Receipt
        </Text>
        <Badge label="Bluetooth printing isn't wired in the app yet" tone="warning" />
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
          Connecting a real thermal printer here needs a native Bluetooth module (e.g. react-native-ble-plx) plus a
          new custom development build via EAS — this is a bigger change than a normal screen update, so it's
          queued pending founder confirmation rather than added silently. The merchant and admin web portals
          already support Bluetooth ESC/POS printing today via the browser's Web Bluetooth API.
        </Text>
      </GlassCard>

      <Button label="Back to Home" onPress={() => navigation.replace("MainTabs")} />
    </ScreenContainer>
  );
}
