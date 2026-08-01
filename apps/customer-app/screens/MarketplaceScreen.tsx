import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { useCategories, useStores } from "@rapex/api-client";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { StoreCard } from "../components/StoreCard";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Marketplace">,
  NativeStackScreenProps<RootStackParamList>
>;

function CategoryChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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

export function MarketplaceScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const { data: categories } = useCategories();
  const { data: stores, loading, error, refetch } = useStores(categoryId);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
          Marketplace
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined as string | undefined, name: "All" }, ...(categories ?? [])]}
          keyExtractor={(item) => item.id ?? "all"}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => (
            <CategoryChip label={item.name} active={categoryId === item.id} onPress={() => setCategoryId(item.id)} />
          )}
        />
      </View>

      {loading ? <Loading label="Loading stores…" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={refetch} /> : null}
      {!loading && !error && stores?.length === 0 ? (
        <EmptyState title="No stores in this category" description="Try a different category." />
      ) : null}
      {!loading && !error && stores && stores.length > 0 ? (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => (
            <StoreCard store={item} onPress={() => navigation.navigate("Store", { storeId: item.id })} />
          )}
        />
      ) : null}
    </View>
  );
}
