import { useMemo, useState } from "react";
import { Pressable, ScrollView, View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, Button, Badge, EmptyState, Input } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useAsync, useAsyncAction, useMyOrders, useRepositories, type CartLine } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { useCartLines, clearCart } from "../services/cartStore";
import { useDeliveryAddress } from "../services/addressStore";
import { validateVoucher, FIRST_ORDER_FREE_DELIVERY_MIN_SUBTOTAL, type VoucherResult } from "../services/vouchers";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

type VehicleKey = "bicycle" | "motorcycle" | "car";

/**
 * Base delivery fee + detection radius + a mock nearby-rider count per
 * vehicle type, per founder-supplied reference pricing (2026-08-20).
 * Real per-vehicle-type rider availability has no confirmed Xano endpoint
 * yet -- these counts are illustrative mock data, not a live lookup, same
 * discipline as the rest of this screen's "Preview totals are a mock
 * estimate" badge.
 */
const VEHICLE_OPTIONS: { key: VehicleKey; label: string; iconLabel: string; basePrice: number; radiusKm: number; nearbyRiders: number }[] = [
  { key: "bicycle", label: "Bicycle", iconLabel: "🚲", basePrice: 40, radiusKm: 1, nearbyRiders: 2 },
  { key: "motorcycle", label: "Motorcycle", iconLabel: "🏍️", basePrice: 50, radiusKm: 2, nearbyRiders: 1 },
  { key: "car", label: "Car", iconLabel: "🚗", basePrice: 120, radiusKm: 3, nearbyRiders: 0 },
];

function VehicleSelector({
  selectedKey,
  deliveryTiming,
  onSelectNow,
  onSelectLater,
}: {
  selectedKey: VehicleKey | null;
  deliveryTiming: "now" | "later" | null;
  onSelectNow: (key: VehicleKey) => void;
  onSelectLater: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Delivery Vehicle</Text>
      {VEHICLE_OPTIONS.map((vehicle) => {
        const active = selectedKey === vehicle.key && deliveryTiming === "now";
        const available = vehicle.nearbyRiders > 0;
        return (
          <Pressable
            key={vehicle.key}
            disabled={!available}
            onPress={() => onSelectNow(vehicle.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderWidth: active ? 2 : 1,
              borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
              backgroundColor: active ? theme.colors.surfaceAlt : "transparent",
              opacity: available ? 1 : 0.5,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.brandPrimary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: theme.typography.fontSize.lg }}>{vehicle.iconLabel}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>{vehicle.label}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>
                {available ? `${vehicle.nearbyRiders} rider${vehicle.nearbyRiders > 1 ? "s" : ""} available nearby` : "No rider available nearby"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.colors.accent, fontWeight: "800", fontSize: theme.typography.fontSize.sm }}>{formatPeso(vehicle.basePrice)}</Text>
              {active ? <Badge label="Order Now" tone="success" /> : !available ? <Badge label="Unavailable" tone="neutral" /> : null}
            </View>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onSelectLater}
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: deliveryTiming === "later" ? 2 : 1,
          borderColor: deliveryTiming === "later" ? theme.colors.brandPrimary : theme.colors.border,
          backgroundColor: deliveryTiming === "later" ? theme.colors.surfaceAlt : "transparent",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>Order Later</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
          Standard delivery within 24 hours -- no need to wait for a rider now
        </Text>
      </Pressable>
    </View>
  );
}

function VoucherSection({
  appliedVoucher,
  onApply,
  onRemove,
}: {
  appliedVoucher: VoucherResult | null;
  onApply: (code: string) => string | null;
  onRemove: () => void;
}) {
  const theme = useAppTheme();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (appliedVoucher) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.success,
          backgroundColor: theme.colors.surfaceAlt,
        }}
      >
        <View>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>{appliedVoucher.code}</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>{appliedVoucher.description}</Text>
        </View>
        <Button label="Remove" variant="outline" size="sm" onPress={onRemove} />
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Voucher Code</Text>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}>
          <Input value={code} onChangeText={setCode} placeholder="Enter voucher code" autoCapitalize="characters" />
        </View>
        <Button
          label="Apply"
          variant="secondary"
          onPress={() => {
            const result = onApply(code);
            setError(result);
            if (!result) setCode("");
          }}
        />
      </View>
      {error ? <Badge label={error} tone="error" /> : null}
    </View>
  );
}

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
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleKey | null>(null);
  const [deliveryTiming, setDeliveryTiming] = useState<"now" | "later" | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResult | null>(null);

  const { data: walletSummary, loading: walletLoading } = useAsync(() => wallet.getWalletSummary(), []);
  const { data: pastOrders } = useMyOrders();
  const isFirstOrder = (pastOrders?.length ?? 0) === 0;

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

  const selectedVehicleOption = VEHICLE_OPTIONS.find((v) => v.key === selectedVehicle) ?? null;
  const baseDeliveryFee = deliveryTiming === "now" && selectedVehicleOption ? selectedVehicleOption.basePrice : summary.deliveryFee;

  // First order P150+ gets free delivery automatically -- no code needed.
  // A manually-applied voucher takes priority over the auto-promo rather
  // than stacking (see docs/business/Commissions.md's coupon-engine notes).
  const firstOrderFreeDeliveryEligible = !appliedVoucher && isFirstOrder && summary.subtotal >= FIRST_ORDER_FREE_DELIVERY_MIN_SUBTOTAL;
  const voucherFreeDelivery = appliedVoucher?.freeDelivery ?? firstOrderFreeDeliveryEligible;
  const voucherAmountDiscount = appliedVoucher?.discountAmount ?? 0;
  const effectiveDeliveryFee = voucherFreeDelivery ? 0 : baseDeliveryFee;
  const deliveryDiscount = baseDeliveryFee - effectiveDeliveryFee;
  const effectiveTotal = Math.max(0, summary.subtotal + effectiveDeliveryFee + summary.platformFee - voucherAmountDiscount);
  const canPlaceOrder = !!address && !!deliveryTiming;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <Text style={{ fontSize: theme.typography.fontSize.xl, fontWeight: "700", color: theme.colors.textPrimary }}>
        Order Summary
      </Text>
      <Badge label="Preview totals are a mock estimate — no confirmed Xano pricing endpoint yet" tone="warning" />
      {firstOrderFreeDeliveryEligible ? (
        <Badge label={`🎉 Free delivery on your first order (₱${FIRST_ORDER_FREE_DELIVERY_MIN_SUBTOTAL}+)`} tone="success" />
      ) : null}

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
      <Row label="Delivery Fee" value={formatPeso(baseDeliveryFee)} />
      {deliveryDiscount > 0 ? <Row label="Delivery Discount" value={`- ${formatPeso(deliveryDiscount)}`} /> : null}
      {voucherAmountDiscount > 0 ? <Row label="Voucher Discount" value={`- ${formatPeso(voucherAmountDiscount)}`} /> : null}
      {summary.platformFee > 0 ? <Row label="Platform Fee" value={formatPeso(summary.platformFee)} /> : null}
      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <Row label="Final Total" value={formatPeso(effectiveTotal)} />

      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <VoucherSection
        appliedVoucher={appliedVoucher}
        onApply={(code) => {
          const result = validateVoucher(code, summary.subtotal);
          if (!result.ok) return result.error;
          setAppliedVoucher(result.result);
          return null;
        }}
        onRemove={() => setAppliedVoucher(null)}
      />

      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <Row label="Wallet Balance" value={walletLoading || !walletSummary ? "…" : formatPeso(walletSummary.balance)} />
      {walletSummary ? (
        <>
          <Row label="Remaining Wallet (after this order)" value={formatPeso(walletSummary.balance - effectiveTotal)} />
          {walletSummary.balance < effectiveTotal ? (
            <Badge label="Insufficient wallet balance" tone="error" />
          ) : null}
        </>
      ) : null}

      <View style={{ height: 1, backgroundColor: theme.colors.border }} />
      <VehicleSelector
        selectedKey={selectedVehicle}
        deliveryTiming={deliveryTiming}
        onSelectNow={(key) => {
          setSelectedVehicle(key);
          setDeliveryTiming("now");
        }}
        onSelectLater={() => setDeliveryTiming("later")}
      />

      {placeOrder.error ? <ErrorState description={placeOrder.error} /> : null}

      <PaymentMethodSelector />
      <Badge label="Place Order calls the real Xano backend — response shape unverified live" tone="info" />
      {!address ? <ErrorState description="Set a delivery address before placing your order." /> : null}
      {!deliveryTiming ? <ErrorState description="Choose a delivery vehicle (or Order Later) before placing your order." /> : null}
      <Button
        label="Place Order"
        loading={placeOrder.loading}
        disabled={!canPlaceOrder}
        onPress={async () => {
          await placeOrder.execute(lines);
          if (isCartCheckout) clearCart();
          navigation.replace("Orders");
        }}
      />
    </ScrollView>
  );
}
