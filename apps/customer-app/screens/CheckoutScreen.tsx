import { useMemo } from "react";
import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, Button, Badge, EmptyState } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useAsync, useAsyncAction, useRepositories, type CartLine } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { useCartLines, clearCart } from "../services/cartStore";
import { useDeliveryAddress } from "../services/addressStore";

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

/**
 * UI-only architecture prep, per instruction: RAPEX Wallet is the only
 * `payment_method` value the confirmed Xano contract accepts for Alpha
 * (see XanoOrdersRepository's doc comment) -- COD/GCash/Maya/QRPH are shown
 * so the future shape is visible, but disabled rather than wired to a fake
 * parameter. OrdersRepository.placeOrder() intentionally does not take a
 * payment method argument yet -- adding one would imply the backend can
 * accept it, which it can't confirm today.
 */
const DISABLED_PAYMENT_METHODS = ["Cash on Delivery (COD)", "GCash", "Maya", "QRPH"] as const;

function PaymentMethodSelector() {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Payment Method</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.brandPrimary,
          backgroundColor: theme.colors.surfaceAlt,
        }}
      >
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>
          RAPEX Wallet
        </Text>
        <Badge label="Selected" tone="success" />
      </View>
      {DISABLED_PAYMENT_METHODS.map((method) => (
        <View
          key={method}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            opacity: 0.5,
          }}
        >
          <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>{method}</Text>
          <Badge label="Requires configuration" tone="neutral" />
        </View>
      ))}
    </View>
  );
}

export function CheckoutScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { marketplace, orders, wallet } = useRepositories();
  // No params (navigated from the cart) -> checkout the whole cart. Params
  // present (navigated from Product's "Checkout" button) -> single-item
  // quick-buy, independent of whatever else is in the cart.
  const isCartCheckout = route.params === undefined;
  const { productId, quantity } = route.params ?? { productId: undefined, quantity: 0 };

  const cartLines = useCartLines();
  const address = useDeliveryAddress();

  const { data: walletSummary, loading: walletLoading } = useAsync(() => wallet.getWalletSummary(), []);

  const { data: product, loading: productLoading, error: productError } = useAsync(
    () => (productId ? marketplace.getProductById(productId) : Promise.resolve(null)),
    [productId],
  );

  const lines: CartLine[] = useMemo(() => {
    if (isCartCheckout) return cartLines;
    return product
      ? [{ productId: product.id, productName: product.name, storeName: product.storeName, unitPrice: product.price, quantity }]
      : [];
  }, [isCartCheckout, cartLines, product, quantity]);

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useAsync(() => (lines.length > 0 ? orders.getCheckoutSummary(lines) : Promise.resolve(null)), [lines]);

  const placeOrder = useAsyncAction((cartLines: CartLine[]) => orders.placeOrder(cartLines));

  if (productLoading || summaryLoading) return <Loading label="Preparing checkout…" />;
  if (productError) return <ErrorState description={productError} />;
  if (summaryError) return <ErrorState description={summaryError} />;
  if (lines.length === 0) return <EmptyState title="Nothing to check out" description="Your cart is empty." />;
  if (!summary) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <Text style={{ fontSize: theme.typography.fontSize.xl, fontWeight: "700", color: theme.colors.textPrimary }}>
        Order Summary
      </Text>
      <Badge label="Preview totals are a mock estimate — no confirmed Xano pricing endpoint yet" tone="warning" />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Delivery Address</Text>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary, fontWeight: "600" }}>
            {address ? `${address.label} — ${address.line}, ${address.municipality}` : "No address set"}
          </Text>
        </View>
        <Button label={address ? "Change" : "Set Address"} variant="outline" size="sm" onPress={() => navigation.navigate("Address")} />
      </View>
      <View style={{ height: 1, backgroundColor: theme.colors.border }} />

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

      <PaymentMethodSelector />
      <Badge label="Place Order calls the real Xano backend — response shape unverified live" tone="info" />
      {!address ? <ErrorState description="Set a delivery address before placing your order." /> : null}
      <Button
        label="Place Order"
        loading={placeOrder.loading}
        disabled={!address}
        onPress={async () => {
          await placeOrder.execute(lines);
          if (isCartCheckout) clearCart();
          navigation.replace("Orders");
        }}
      />
    </View>
  );
}
