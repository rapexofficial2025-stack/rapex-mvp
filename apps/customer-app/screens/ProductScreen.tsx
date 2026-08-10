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
import { addToCart, useCartCount } from "../services/cartStore";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data: product, loading, error, refetch } = useProduct(route.params.productId);
  const wishlistedIds = useWishlistedProductIds();
  const cartCount = useCartCount();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) recordProductView(product.id);
  }, [product]);

  if (loading) return <Loading label="Loading product…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!product) return <EmptyState title="Product not found" />;

  const isWishlisted = wishlistedIds.has(product.id);

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
        {formatPeso(product.price)}
      </Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{product.description}</Text>
      <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        {product.stock} in stock
      </Text>

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
        label={`Add to Cart${cartCount > 0 ? ` (${cartCount})` : ""}`}
        variant="secondary"
        onPress={() => {
          addToCart({ productId: product.id, productName: product.name, storeName: product.storeName, unitPrice: product.price, quantity });
          showToast(`Added ${quantity} × ${product.name} to cart`, "success");
        }}
      />
      <Button
        label="Checkout"
        onPress={() => navigation.navigate("Checkout", { productId: product.id, quantity })}
      />
    </ScreenContainer>
  );
}
