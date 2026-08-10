import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatPeso } from "@rapex/utils";
import { useStoreDetail, useStoreProducts, type ProductSummary } from "@rapex/api-client";
import { Badge, Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useWishlistedProductIds } from "../services/wishlistStore";
import { addToCart, removeFromCart, updateCartQuantity, useCartLines } from "../services/cartStore";
import { FloatingCartPreview } from "./FloatingCartPreview";
import { CartSummaryBar } from "./CartSummaryBar";

type StoreCartModalProps = {
  storeId: string | null;
  onClose: () => void;
  onProceed: () => void;
};

export function StoreCartModal({ storeId, onClose, onProceed }: StoreCartModalProps) {
  const theme = useAppTheme();
  const { data: store, loading: storeLoading, error: storeError } = useStoreDetail(storeId ?? "");
  const { data: products, loading: productsLoading, error: productsError } = useStoreProducts(storeId ?? "");
  const wishlistedIds = useWishlistedProductIds();
  const cartLines = useCartLines();

  const savedProducts = (products ?? []).filter((p) => wishlistedIds.has(p.id));
  const storeCartLines = cartLines.filter((l) => savedProducts.some((p) => p.id === l.productId));
  const storeSubtotal = storeCartLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const imageLabelByProductId = Object.fromEntries(savedProducts.map((p) => [p.id, p.imageLabel]));

  return (
    <Modal visible={storeId !== null} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }]}>
          <View style={[styles.header, { padding: theme.spacing.lg, borderBottomColor: theme.colors.border }]}>
            <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
              {store?.name ?? "Store"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ fontSize: theme.typography.fontSize.xl, color: theme.colors.textSecondary }}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 140, gap: theme.spacing.md }}>
            {storeLoading || productsLoading ? <Loading label="Loading store…" /> : null}
            {storeError ? <ErrorState description={storeError} /> : null}
            {productsError ? <ErrorState description={productsError} /> : null}

            {store ? (
              <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" }}>
                <Text style={{ fontSize: 32 }}>{store.logoLabel}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                    {store.distanceLabel} · {store.deliveryTimeLabel}
                  </Text>
                  <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                    {store.businessHours}
                  </Text>
                </View>
                <Badge label={store.isOpen ? "Open" : "Closed"} tone={store.isOpen ? "success" : "neutral"} />
              </View>
            ) : null}

            <FloatingCartPreview lines={storeCartLines} imageLabelByProductId={imageLabelByProductId} />

            <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>
              🛒 Available Save List Items
            </Text>

            {!productsLoading && savedProducts.length === 0 ? (
              <EmptyState title="No saved items from this store" description="Save products from this store to see them here." />
            ) : null}

            {savedProducts.map((product) => (
              <StoreCartRow key={product.id} product={product} storeName={store?.name ?? ""} />
            ))}
          </ScrollView>

          <CartSummaryBar itemCount={storeCartLines.reduce((s, l) => s + l.quantity, 0)} subtotal={storeSubtotal} onProceed={onProceed} />
        </View>
      </View>
    </Modal>
  );
}

function StoreCartRow({ product, storeName }: { product: ProductSummary; storeName: string }) {
  const theme = useAppTheme();
  const cartLines = useCartLines();
  const line = cartLines.find((l) => l.productId === product.id);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
      }}
    >
      <Text style={{ fontSize: 28 }}>{product.imageLabel}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "600", color: theme.colors.textPrimary }}>
          {product.name}
        </Text>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.brandPrimary, fontWeight: "700" }}>
          {formatPeso(product.price)}
        </Text>
        {line ? <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>Qty: {line.quantity}</Text> : null}
      </View>

      {line ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
          <Pressable
            onPress={() => updateCartQuantity(product.id, line.quantity - 1)}
            style={[styles.stepperButton, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.textPrimary }}>−</Text>
          </Pressable>
          <Pressable
            onPress={() => updateCartQuantity(product.id, line.quantity + 1)}
            style={[styles.stepperButton, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.textPrimary }}>+</Text>
          </Pressable>
          <Pressable onPress={() => removeFromCart(product.id)}>
            <View style={[styles.pill, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.pillText}>Remove</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() =>
            addToCart({ productId: product.id, productName: product.name, storeName, unitPrice: product.price, quantity: 1 })
          }
        >
          <View style={[styles.pill, { backgroundColor: theme.colors.brandPrimary }]}>
            <Text style={styles.pillText}>CART</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pillText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
});
