import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState, Badge } from "@rapex/ui-native";
import { useStore, useStoreProducts } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { ProductCard } from "../components/ProductCard";

type Props = NativeStackScreenProps<RootStackParamList, "Store">;

export function StoreScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { storeId } = route.params;
  const { data: store, loading: storeLoading, error: storeError, refetch: refetchStore } = useStore(storeId);
  const { data: products, loading: productsLoading, error: productsError } = useStoreProducts(storeId);

  if (storeLoading) return <Loading label="Loading store…" />;
  if (storeError) return <ErrorState description={storeError} onRetry={refetchStore} />;
  if (!store) return <EmptyState title="Store not found" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xxs }}>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.textPrimary }}>
          {store.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
            {store.category} · {store.distanceLabel} · {store.rating} ⭐
          </Text>
          <Badge label={store.isOpen ? "Open" : "Closed"} tone={store.isOpen ? "success" : "neutral"} />
        </View>
      </View>

      {productsLoading ? <Loading label="Loading products…" /> : null}
      {!productsLoading && productsError ? <ErrorState description={productsError} /> : null}
      {!productsLoading && !productsError && products?.length === 0 ? (
        <EmptyState title="No products yet" description="This store hasn't listed anything yet." />
      ) : null}
      {!productsLoading && !productsError && products && products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate("Product", { productId: item.id })} />
          )}
        />
      ) : null}
    </View>
  );
}
