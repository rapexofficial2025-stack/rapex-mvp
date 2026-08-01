import { useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SearchBar, NotificationBell, Skeleton, ErrorState } from "@rapex/ui-native";
import { useCategories, useFeaturedStores, useStores, useRepositories } from "@rapex/api-client";
import type { ProductSummary } from "@rapex/api-client";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { StoreCard } from "../components/StoreCard";
import { ProductCardCompact } from "../components/ProductCardCompact";
import { CategoryCard } from "../components/CategoryCard";
import { SectionHeader } from "../components/SectionHeader";
import { PromoBanner } from "../components/PromoBanner";
import { ComingSoonCard } from "../components/ComingSoonCard";
import { WalletSummaryCard } from "../components/WalletSummaryCard";
import { useRecentlyViewedIds } from "../services/recentlyViewedStore";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

function ProductCarouselSkeleton() {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} width={128} height={128} radius={theme.radius.md} />
      ))}
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { marketplace } = useRepositories();

  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: featuredStores, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } =
    useFeaturedStores();
  const { data: nearbyStores, loading: nearbyLoading } = useStores(undefined);

  const [allProducts, setAllProducts] = useState<ProductSummary[] | null>(null);
  useEffect(() => {
    marketplace.searchProducts("").then(setAllProducts);
  }, [marketplace]);

  const recentlyViewedIds = useRecentlyViewedIds();
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<ProductSummary[]>([]);
  useEffect(() => {
    if (recentlyViewedIds.length === 0) {
      setRecentlyViewedProducts([]);
      return;
    }
    Promise.all(recentlyViewedIds.map((id) => marketplace.getProductById(id))).then((results) => {
      setRecentlyViewedProducts(results.filter((p): p is NonNullable<typeof p> => p !== null));
    });
  }, [recentlyViewedIds, marketplace]);

  const flashDeals = allProducts?.slice(0, 3) ?? [];
  const featuredProducts = allProducts?.slice(2) ?? [];
  const lastViewed = recentlyViewedProducts[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.lg, gap: theme.spacing.xl }}>
        {/* Header: delivery address + notifications */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <Pressable style={{ flex: 1 }}>
            <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              Deliver to
            </Text>
            <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>
              Home — 123 Rizal St, Imus, Cavite ▾
            </Text>
          </Pressable>
          <NotificationBell count={2} />
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <SearchBar placeholder="Search stores, products…" onPress={() => navigation.navigate("Marketplace")} />
        </View>

        {/* Wallet summary */}
        <WalletSummaryCard onPress={() => navigation.navigate("Wallet")} />

        {/* Categories carousel */}
        <View>
          <SectionHeader title="Categories" />
          {categoriesLoading ? (
            <View style={{ flexDirection: "row", gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width={56} height={56} radius={28} />
              ))}
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories ?? []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg }}
              renderItem={({ item }) => (
                <CategoryCard
                  iconLabel={item.iconLabel}
                  name={item.name}
                  onPress={() => navigation.navigate("MainTabs", { screen: "Marketplace", params: { categoryId: item.id } })}
                />
              )}
            />
          )}
        </View>

        {/* Promo banner */}
        <PromoBanner title="₱50 off your first order" subtitle="Use code RAPEXWELCOME at checkout" />

        {/* Flash deals */}
        <View>
          <SectionHeader title="Flash Deals" actionLabel="See All" onAction={() => navigation.navigate("Marketplace")} />
          {allProducts === null ? (
            <ProductCarouselSkeleton />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={flashDeals}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
              renderItem={({ item }) => (
                <ProductCardCompact
                  product={item}
                  badgeLabel="Deal"
                  onPress={() => navigation.navigate("Product", { productId: item.id })}
                />
              )}
            />
          )}
        </View>

        {/* Featured products */}
        <View>
          <SectionHeader title="Featured Products" />
          {allProducts === null ? (
            <ProductCarouselSkeleton />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredProducts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
              renderItem={({ item }) => (
                <ProductCardCompact product={item} onPress={() => navigation.navigate("Product", { productId: item.id })} />
              )}
            />
          )}
        </View>

        {/* Nearby stores */}
        <View>
          <SectionHeader title="Nearby Stores" />
          {nearbyLoading ? (
            <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
              <Skeleton height={64} radius={theme.radius.md} />
              <Skeleton height={64} radius={theme.radius.md} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
              {(nearbyStores ?? []).map((store) => (
                <StoreCard key={store.id} store={store} onPress={() => navigation.navigate("Store", { storeId: store.id })} />
              ))}
            </View>
          )}
        </View>

        {/* Recommended stores */}
        <View>
          <SectionHeader title="Recommended for You" />
          {featuredLoading ? (
            <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
              <Skeleton height={64} radius={theme.radius.md} />
            </View>
          ) : featuredError ? (
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <ErrorState description={featuredError} onRetry={refetchFeatured} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
              {(featuredStores ?? []).map((store) => (
                <StoreCard key={store.id} store={store} onPress={() => navigation.navigate("Store", { storeId: store.id })} />
              ))}
            </View>
          )}
        </View>

        {/* Recently viewed + continue shopping */}
        {recentlyViewedProducts.length > 0 ? (
          <>
            <View>
              <SectionHeader title="Recently Viewed" />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={recentlyViewedProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
                renderItem={({ item }) => (
                  <ProductCardCompact product={item} onPress={() => navigation.navigate("Product", { productId: item.id })} />
                )}
              />
            </View>

            {lastViewed ? (
              <Pressable
                onPress={() => navigation.navigate("Product", { productId: lastViewed.id })}
                style={{
                  marginHorizontal: theme.spacing.lg,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
                  Continue shopping: {lastViewed.name}
                </Text>
                <Text style={{ color: theme.colors.accent, fontWeight: "700" }}>→</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {/* Coming soon */}
        <View>
          <SectionHeader title="Coming Soon" />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { key: "auction", iconLabel: "🏆", title: "Auction", description: "Bid on unique local finds", onPress: () => navigation.navigate("AuctionHome") },
              { key: "provider", iconLabel: "🛠️", title: "Provider", description: "Book trusted local services" },
              { key: "community", iconLabel: "💬", title: "Community", description: "Connect with your barangay" },
            ]}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}
            renderItem={({ item }) => (
              <ComingSoonCard iconLabel={item.iconLabel} title={item.title} description={item.description} onPress={item.onPress} />
            )}
          />
        </View>
      </ScrollView>

      {/* R.E.X. floating assistant */}
      <Pressable
        onPress={() => navigation.navigate("Rex")}
        style={{
          position: "absolute",
          bottom: theme.spacing.xl,
          right: theme.spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.brandPrimary,
          alignItems: "center",
          justifyContent: "center",
          ...theme.shadows.lg.native,
        }}
      >
        <Text style={{ fontSize: theme.typography.fontSize.xl }}>🐰</Text>
      </Pressable>
    </View>
  );
}
