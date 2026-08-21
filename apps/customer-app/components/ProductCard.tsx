import { Pressable, Text, View } from "react-native";
import { formatPeso } from "@rapex/utils";
import { useToast } from "@rapex/ui-native";
import type { ProductSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";
import { addToCart } from "../services/cartStore";

type ProductCardProps = {
  product: ProductSummary;
  storeName: string;
  onPress: () => void;
};

/** Grid cell with a quick-add button, matching the founder's store-detail reference (2026-08-20). */
export function ProductCard({ product, storeName, onPress }: ProductCardProps) {
  const theme = useAppTheme();
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 96,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: theme.typography.fontSize["2xl"] }}>{product.imageLabel}</Text>
      </View>
      <View style={{ padding: theme.spacing.sm, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "600", color: theme.colors.textPrimary, minHeight: 34 }}>
          {product.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.brandPrimary, fontWeight: "700" }}>
            {formatPeso(product.price)}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              addToCart({ productId: product.id, productName: product.name, storeName, unitPrice: product.price, quantity: 1 });
              showToast(`Added ${product.name} to cart`, "success");
            }}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: theme.colors.brandPrimary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.colors.textInverse, fontSize: theme.typography.fontSize.base, fontWeight: "700", lineHeight: 18 }}>+</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
