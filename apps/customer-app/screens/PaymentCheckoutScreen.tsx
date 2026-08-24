import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, ErrorState, Loading } from "@rapex/ui-native";
import { useRepositories, mockSimulatePaymentOutcome, type PaymentCheckout } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { clearCart } from "../services/cartStore";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentCheckout">;

const METHOD_LABEL: Record<PaymentCheckout["method"], string> = {
  gcash: "GCash",
  qrph: "QR Ph",
};

/**
 * A real PayMongo checkout redirects the customer to a PayMongo-hosted page
 * (returned as `checkoutUrl` by the Xano endpoint documented in
 * XanoPaymentsRepository) and PayMongo calls back via webhook when it's
 * done. That endpoint doesn't exist in Xano yet -- see
 * docs/business/PayMongoIntegration.md -- so this screen doubles as an
 * honest in-app simulator until it does: the two buttons below stand in
 * for "the customer finished paying on PayMongo's page and it redirected
 * back", not a real payment.
 */
export function PaymentCheckoutScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { payments } = useRepositories();
  const { referenceId, method, orderId } = route.params;
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const refresh = () => {
    setError(null);
    payments
      ?.getCheckoutStatus(referenceId)
      .then(setCheckout)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load checkout status."));
  };

  useEffect(refresh, [payments, referenceId]);

  if (error) return <ErrorState description={error} onRetry={refresh} />;
  if (!checkout) return <Loading label="Loading checkout…" />;

  const simulate = async (status: "paid" | "failed") => {
    setResolving(true);
    mockSimulatePaymentOutcome(referenceId, status);
    refresh();
    setResolving(false);
  };

  return (
    <ScreenContainer title={`Pay with ${METHOD_LABEL[method]}`} subtitle={`Order #${orderId}`}>
      <Badge label="Simulated checkout — no confirmed Xano PayMongo endpoint yet" tone="warning" />

      <View style={{ alignItems: "center", gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}>
        <Text style={{ fontSize: 48 }}>{method === "gcash" ? "💙" : "🔲"}</Text>
        <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
          {checkout.status === "pending" ? `Waiting for ${METHOD_LABEL[method]} payment…` : checkout.status === "paid" ? "Payment received" : "Payment failed"}
        </Text>
        <Badge
          label={checkout.status.toUpperCase()}
          tone={checkout.status === "paid" ? "success" : checkout.status === "failed" ? "error" : "warning"}
        />
      </View>

      {checkout.status === "pending" ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, textAlign: "center" }}>
            On a real PayMongo checkout you'd be redirected to {METHOD_LABEL[method]} here. Since that server-side piece
            isn't built yet, simulate the outcome to keep testing the rest of the flow:
          </Text>
          <Button label="Simulate Successful Payment" loading={resolving} onPress={() => simulate("paid")} />
          <Button label="Simulate Failed Payment" variant="outline" loading={resolving} onPress={() => simulate("failed")} />
        </View>
      ) : null}

      {checkout.status === "paid" ? (
        <Button
          label="Back to Orders"
          onPress={() => {
            clearCart();
            navigation.replace("Orders");
          }}
        />
      ) : null}

      {checkout.status === "failed" ? <Button label="Back to Checkout" variant="outline" onPress={() => navigation.goBack()} /> : null}
    </ScreenContainer>
  );
}
