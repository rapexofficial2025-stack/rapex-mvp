import { Pressable, Text, View } from "react-native";
import { formatPeso } from "@rapex/utils";
import type { ProductSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

type ProductCardProps = {
  product: ProductSummary;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
      }}
    >
      <Text style={{ fontSize: theme.typography.fontSize["2xl"] }}>{product.imageLabel}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "600", color: theme.colors.textPrimary }}>
          {product.name}
        </Text>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.brandPrimary, fontWeight: "700" }}>
          {formatPeso(product.price)}
        </Text>
      </View>
    </Pressable>
  );
}
