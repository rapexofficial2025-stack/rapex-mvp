import { Pressable, Text, View } from "react-native";
import { Badge } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import type { ProductSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

type ProductCardCompactProps = {
  product: ProductSummary;
  badgeLabel?: string;
  onPress: () => void;
};

/** Vertical card for horizontal-scrolling product carousels (Flash Deals, Featured Products). */
export function ProductCardCompact({ product, badgeLabel, onPress }: ProductCardCompactProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 128,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        gap: theme.spacing.xxs,
        ...theme.shadows.sm.native,
      }}
    >
      <View
        style={{
          height: 64,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: theme.typography.fontSize["2xl"] }}>{product.imageLabel}</Text>
        {badgeLabel ? (
          <View style={{ position: "absolute", top: 4, left: 4 }}>
            <Badge label={badgeLabel} tone="accent" />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={2} style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textPrimary }}>
        {product.name}
      </Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.brandPrimary }}>
        {formatPeso(product.price)}
      </Text>
    </Pressable>
  );
}
