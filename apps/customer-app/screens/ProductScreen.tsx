import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState, Button } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useProduct } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data: product, loading, error, refetch } = useProduct(route.params.productId);

  if (loading) return <Loading label="Loading product…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!product) return <EmptyState title="Product not found" />;

  return (
    <ScreenContainer title={product.name} subtitle={product.storeName}>
      <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
        {formatPeso(product.price)}
      </Text>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{product.description}</Text>
      <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        {product.stock} in stock
      </Text>
      <Button
        label="Checkout"
        onPress={() => navigation.navigate("Checkout", { productId: product.id, quantity: 1 })}
      />
    </ScreenContainer>
  );
}
