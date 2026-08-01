import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState, Badge, Button, SearchBar } from "@rapex/ui-native";
import { useStoreDetail, useStoreProducts, useRepositories } from "@rapex/api-client";
import type { ProductSummary } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { ProductCard } from "../components/ProductCard";
import { ProductCardCompact } from "../components/ProductCardCompact";
import { SectionHeader } from "../components/SectionHeader";
import { isFavoriteStore, toggleFavoriteStore, useFavoriteStoreIds } from "../services/favoriteStoresStore";

type Props = NativeStackScreenProps<RootStackParamList, "Store">;

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
        borderRadius: theme.radius.full,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Text style={{ color: active ? theme.colors.textInverse : theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StoreScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { storeId } = route.params;
  const { marketplace } = useRepositories();

  const { data: store, loading: storeLoading, error: storeError, refetch: refetchStore } = useStoreDetail(storeId);
  const { data: products, loading: productsLoading, error: productsError } = useStoreProducts(storeId);
  const favoriteIds = useFavoriteStoreIds();

  const [productCategory, setProductCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [recommended, setRecommended] = useState<ProductSummary[]>([]);

  useEffect(() => {
    marketplace.searchProducts("").then((all) => {
      setRecommended(all.filter((p) => p.storeId !== storeId).slice(0, 4));
    });
  }, [marketplace, storeId]);

  const productCategories = useMemo(() => {
    const unique = new Set((products ?? []).map((p) => p.productCategory));
    return Array.from(unique);
  }, [products]);

  const visibleProducts = useMemo(() => {
    let result = products ?? [];
    if (productCategory) result = result.filter((p) => p.productCategory === productCategory);
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));
    return result;
  }, [products, productCategory, query]);

  if (storeLoading) return <Loading label="Loading store…" />;
  if (storeError) return <ErrorState description={storeError} onRetry={refetchStore} />;
  if (!store) return <EmptyState title="Store not found" />;

  const isFavorite = favoriteIds.has(store.id) || isFavoriteStore(store.id);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        ListHeaderComponent={
          <View>
            {/* Hero */}
            <View
              style={{
                height: 120,
                backgroundColor: theme.colors.surfaceAlt,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 48 }}>{store.coverImageLabel}</Text>
            </View>
            <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs, marginTop: -theme.spacing.xl }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 3,
                  borderColor: theme.colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  ...theme.shadows.md.native,
                }}
              >
                <Text style={{ fontSize: theme.typography.fontSize["2xl"] }}>{store.logoLabel}</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                <Text style={{ fontSize: theme.typography.fontSize.xl, fontWeight: "700", color: theme.colors.textPrimary }}>
                  {store.name}
                </Text>
                {store.isVerified ? <Badge label="Verified" tone="info" /> : null}
                <Badge label={store.isOpen ? "Open" : "Closed"} tone={store.isOpen ? "success" : "neutral"} />
              </View>

              <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                {store.rating} ⭐ ({store.reviewCount} reviews) · {store.followerCount.toLocaleString()} followers
              </Text>

              <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{store.description}</Text>

              <View
                style={{
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.sm,
                  gap: theme.spacing.xxs,
                  marginTop: theme.spacing.xs,
                }}
              >
                <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  🕒 {store.businessHours}
                </Text>
                <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  🛵 {formatPeso(store.deliveryFee)} delivery fee · {store.deliveryTimeLabel}
                </Text>
                <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  🧾 {formatPeso(store.minimumOrder)} minimum order
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button label="Chat" variant="secondary" size="sm" onPress={() => {}} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Share" variant="secondary" size="sm" onPress={() => {}} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={isFavorite ? "★ Favorited" : "☆ Favorite"}
                    variant={isFavorite ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => toggleFavoriteStore(store.id)}
                  />
                </View>
              </View>
            </View>

            {/* Recommended products (from other stores) */}
            {recommended.length > 0 ? (
              <View style={{ marginBottom: theme.spacing.lg }}>
                <SectionHeader title="You Might Also Like" />
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={recommended}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
                  renderItem={({ item }) => (
                    <ProductCardCompact product={item} onPress={() => navigation.navigate("Product", { productId: item.id })} />
                  )}
                />
              </View>
            ) : null}

            {/* Product search + category tabs */}
            <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
              <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
                Products
              </Text>
              <SearchBar placeholder="Search this store…" value={query} onChangeText={setQuery} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={["All", ...productCategories]}
                keyExtractor={(item) => item}
                contentContainerStyle={{ gap: theme.spacing.xs }}
                renderItem={({ item }) => (
                  <Chip
                    label={item}
                    active={item === "All" ? !productCategory : productCategory === item}
                    onPress={() => setProductCategory(item === "All" ? undefined : item)}
                  />
                )}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          productsLoading ? (
            <Loading label="Loading products…" />
          ) : productsError ? (
            <ErrorState description={productsError} />
          ) : (
            <EmptyState title="No products match" description="Try a different category or search." />
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <ProductCard product={item} onPress={() => navigation.navigate("Product", { productId: item.id })} />
          </View>
        )}
        ListFooterComponent={
          store.reviews.length > 0 ? (
            <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
              <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
                Reviews ({store.reviewCount})
              </Text>
              {store.reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: theme.colors.surfaceAlt,
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.md,
                    gap: theme.spacing.xxs,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>
                      {review.authorName}
                    </Text>
                    <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.accent }}>
                      {"⭐".repeat(review.rating)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}
