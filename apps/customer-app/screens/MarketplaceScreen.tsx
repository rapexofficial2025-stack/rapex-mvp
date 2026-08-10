import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SearchBar, Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { useCategories, useStores } from "@rapex/api-client";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { StoreCard } from "../components/StoreCard";
import { GradientScreenBackground } from "../components/GradientScreenBackground";
import { toggleFavoriteStore, useFavoriteStoreIds } from "../services/favoriteStoresStore";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Marketplace">,
  NativeStackScreenProps<RootStackParamList>
>;

type SortOption = "distance" | "rating" | "deliveryTime" | "name";
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "distance", label: "Nearest" },
  { key: "rating", label: "Top Rated" },
  { key: "deliveryTime", label: "Fastest Delivery" },
  { key: "name", label: "A-Z" },
];

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

export function MarketplaceScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const [categoryId, setCategoryId] = useState<string | undefined>(route.params?.categoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("distance");

  const { data: categories } = useCategories();
  const favoriteIds = useFavoriteStoreIds();

  useEffect(() => {
    if (route.params?.categoryId) setCategoryId(route.params.categoryId);
  }, [route.params?.categoryId]);

  const { data: stores, loading, error, refetch } = useStores(categoryId);

  const visibleStores = useMemo(() => {
    let result = stores ?? [];

    const query = searchQuery.trim().toLowerCase();
    if (query) result = result.filter((s) => s.name.toLowerCase().includes(query));
    if (openOnly) result = result.filter((s) => s.isOpen);
    if (topRatedOnly) result = result.filter((s) => s.rating >= 4.5);
    if (nearbyOnly) result = result.filter((s) => s.distanceKm <= 2);
    if (favoritesOnly) result = result.filter((s) => favoriteIds.has(s.id));

    const sorted = [...result];
    switch (sortBy) {
      case "distance":
        sorted.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "deliveryTime":
        sorted.sort((a, b) => a.deliveryTimeMinMinutes - b.deliveryTimeMinMinutes);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [stores, searchQuery, openOnly, topRatedOnly, nearbyOnly, favoritesOnly, sortBy, favoriteIds]);

  return (
    <View style={{ flex: 1 }}>
      <GradientScreenBackground />
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
          Marketplace
        </Text>

        <SearchBar placeholder="Search stores…" value={searchQuery} onChangeText={setSearchQuery} />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined as string | undefined, name: "All", iconLabel: "🏪" }, ...(categories ?? [])]}
          keyExtractor={(item) => item.id ?? "all"}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => (
            <Chip label={`${item.iconLabel} ${item.name}`} active={categoryId === item.id} onPress={() => setCategoryId(item.id)} />
          )}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: "open", label: "Open Now", active: openOnly, onPress: () => setOpenOnly((v) => !v) },
            { key: "rating", label: "4.5★ & up", active: topRatedOnly, onPress: () => setTopRatedOnly((v) => !v) },
            { key: "nearby", label: "Within 2km", active: nearbyOnly, onPress: () => setNearbyOnly((v) => !v) },
            { key: "favorites", label: "★ Favorites", active: favoritesOnly, onPress: () => setFavoritesOnly((v) => !v) },
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => <Chip label={item.label} active={item.active} onPress={item.onPress} />}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SORT_OPTIONS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => (
            <Chip label={`Sort: ${item.label}`} active={sortBy === item.key} onPress={() => setSortBy(item.key)} />
          )}
        />
      </View>

      {loading ? <Loading label="Loading stores…" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={refetch} /> : null}
      {!loading && !error && visibleStores.length === 0 ? (
        <EmptyState title="No stores match your filters" description="Try adjusting your search or filters." />
      ) : null}
      {!loading && !error && visibleStores.length > 0 ? (
        <FlatList
          data={visibleStores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              onPress={() => navigation.navigate("Store", { storeId: item.id })}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={() => toggleFavoriteStore(item.id)}
            />
          )}
        />
      ) : null}
    </View>
  );
}
