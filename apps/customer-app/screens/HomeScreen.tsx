import { FlatList, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { useFeaturedStores } from "@rapex/api-client";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { StoreCard } from "../components/StoreCard";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { data: stores, loading, error, refetch } = useFeaturedStores();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg }}>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
          RAPEX
        </Text>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          Gawang Lokal, Para sa Masa
        </Text>
      </View>

      {loading ? <Loading label="Loading featured stores…" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={refetch} /> : null}
      {!loading && !error && stores?.length === 0 ? (
        <EmptyState title="No featured stores right now" description="Check back soon." />
      ) : null}

      {!loading && !error && stores && stores.length > 0 ? (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          ListHeaderComponent={
            <Text
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: "700",
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Featured Stores
            </Text>
          }
          renderItem={({ item }) => (
            <StoreCard store={item} onPress={() => navigation.navigate("Store", { storeId: item.id })} />
          )}
        />
      ) : null}
    </View>
  );
}
