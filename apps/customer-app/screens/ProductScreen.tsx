import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState, Button, useToast } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useProduct } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { recordProductView } from "../services/recentlyViewedStore";
import { toggleWishlistProduct, useWishlistedProductIds } from "../services/wishlistStore";
import { addToCart } from "../services/cartStore";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data: product, loading, error, refetch } = useProduct(route.params.productId);
  const wishlistedIds = useWishlistedProductIds();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (product) recordProductView(product.id);
  }, [product]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) setSelectedVariantId(product.variants[0]!.id);
  }, [product]);

  if (loading) return <Loading label="Loading product…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!product) return <EmptyState title="Product not found" />;

  const isWishlisted = wishlistedIds.has(product.id);
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) ?? null;
  const selectedAddOns = (product.addOns ?? []).filter((addOn) => selectedAddOnIds.has(addOn.id));
  const unitPrice = product.price + (selectedVariant?.priceDelta ?? 0) + selectedAddOns.reduce((sum, a) => sum + a.priceDelta, 0);
  const displayName = [product.name, selectedVariant && selectedVariant.priceDelta !== 0 ? `(${selectedVariant.name})` : null, ...selectedAddOns.map((a) => `+${a.name}`)]
    .filter(Boolean)
    .join(" ");

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ScreenContainer
      title={product.name}
      subtitle={product.storeName}
      headerAction={
        <Pressable onPress={() => toggleWishlistProduct(product.id)} hitSlop={8}>
          <Text style={{ fontSize: theme.typography.fontSize.xl, color: isWishlisted ? theme.colors.accent : theme.colors.textDisabled }}>
            {isWishlisted ? "♥" : "♡"}
          </Text>
        </Pressable>
      }
    >
      <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
        {formatPeso(unitPrice)}
      </Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{product.description}</Text>
      <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        {product.stock} in stock
      </Text>

      {product.variants && product.variants.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>Choose Size</Text>
          {product.variants.map((variant) => {
            const active = variant.id === selectedVariantId;
            return (
              <Pressable
                key={variant.id}
                onPress={() => setSelectedVariantId(variant.id)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: theme.spacing.sm,
                  borderRadius: theme.radius.md,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? theme.colors.brandPrimary : theme.colors.border,
                  backgroundColor: active ? theme.colors.surfaceAlt : "transparent",
                }}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>{variant.name}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>
                  {variant.priceDelta > 0 ? `+${formatPeso(variant.priceDelta)}` : formatPeso(product.price)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {product.addOns && product.addOns.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>Choice of Add-ons</Text>
          {product.addOns.map((addOn) => {
            const checked = selectedAddOnIds.has(addOn.id);
            return (
              <Pressable
                key={addOn.id}
                onPress={() => toggleAddOn(addOn.id)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: theme.spacing.sm,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: checked ? theme.colors.brandPrimary : theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>
                  {checked ? "☑" : "☐"} {addOn.name}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>+{formatPeso(addOn.priceDelta)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Quantity</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <Button label="−" variant="outline" size="sm" onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
          <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "600", color: theme.colors.textPrimary, minWidth: 24, textAlign: "center" }}>
            {quantity}
          </Text>
          <Button label="+" variant="outline" size="sm" onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))} />
        </View>
      </View>

      <Button
        label={`Add to Cart — ${formatPeso(unitPrice * quantity)}`}
        variant="secondary"
        onPress={() => {
          addToCart({ productId: product.id, productName: displayName, storeName: product.storeName, unitPrice, quantity });
          showToast(`Added ${quantity} × ${displayName} to cart`, "success");
        }}
      />
      <Button
        label="Checkout"
        onPress={() => {
          addToCart({ productId: product.id, productName: displayName, storeName: product.storeName, unitPrice, quantity });
          navigation.navigate("Checkout");
        }}
      />
    </ScreenContainer>
  );
}
