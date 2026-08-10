import { useMemo } from "react";
import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, Button, Badge } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useAsync, useAsyncAction, useRepositories, type CartLine } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

function Row({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

export function CheckoutScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { marketplace, orders, wallet } = useRepositories();
  const { productId, quantity } = route.params;

  const { data: walletSummary, loading: walletLoading } = useAsync(() => wallet.getWalletSummary(), []);

  const { data: product, loading: productLoading, error: productError } = useAsync(
    () => marketplace.getProductById(productId),
    [productId],
  );

  const lines: CartLine[] = useMemo(
    () =>
      product
        ? [{ productId: product.id, productName: product.name, storeName: product.storeName, unitPrice: product.price, quantity }]
        : [],
    [product, quantity],
  );

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useAsync(() => (lines.length > 0 ? orders.getCheckoutSummary(lines) : Promise.resolve(null)), [lines]);

  const placeOrder = useAsyncAction((cartLines: CartLine[]) => orders.placeOrder(cartLines));

  if (productLoading || summaryLoading) return <Loading label="Preparing checkout…" />;
  if (productError) return <ErrorState description={productError} />;
  if (summaryError) return <ErrorState description={summaryError} />;
  if (!summary) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <Text style={{ fontSize: theme.typography.fontSize.xl, fontWeight: "700", color: theme.colors.textPrimary }}>
        Order Summary
      </Text>
      {summary.lines.map((line) => (
        <Row key={line.productId} label={`${line.productName} × ${line.quantity}`} value={formatPeso(line.unitPrice * line.quantity)} />
      ))}
      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <Row label="Product Total" value={formatPeso(summary.subtotal)} />
      <Row label="Delivery Fee" value={formatPeso(summary.deliveryFee)} />
      {summary.platformFee > 0 ? <Row label="Platform Fee" value={formatPeso(summary.platformFee)} /> : null}
      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <Row label="Final Total" value={formatPeso(summary.total)} />

      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <Row label="Wallet Balance" value={walletLoading || !walletSummary ? "…" : formatPeso(walletSummary.balance)} />
      {walletSummary ? (
        <>
          <Row label="Remaining Wallet (after this order)" value={formatPeso(walletSummary.balance - summary.total)} />
          {walletSummary.balance < summary.total ? (
            <Badge label="Insufficient wallet balance" tone="error" />
          ) : null}
        </>
      ) : null}

      {placeOrder.error ? <ErrorState description={placeOrder.error} /> : null}

      <Button
        label="Place Order"
        loading={placeOrder.loading}
        onPress={async () => {
          await placeOrder.execute(lines);
          navigation.replace("MainTabs");
        }}
      />
    </View>
  );
}
