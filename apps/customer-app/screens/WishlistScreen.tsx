import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Loading, ErrorState, EmptyState } from "@rapex/ui-native";
import { useStores, useWalletSummary, type StoreSummary } from "@rapex/api-client";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { WalletGlassCard } from "../components/WalletGlassCard";
import { StoreCartModal } from "../components/StoreCartModal";
import { useAppTheme } from "../hooks/useAppTheme";
import { useFavoriteStoreIds } from "../services/favoriteStoresStore";
import { useCartLines } from "../services/cartStore";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Wishlist">, NativeStackScreenProps<RootStackParamList>>;

export function WishlistScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { data: allStores, loading, error, refetch } = useStores();
  const { data: wallet } = useWalletSummary();
  const favoriteIds = useFavoriteStoreIds();
  const cartLines = useCartLines();
  const [openStoreId, setOpenStoreId] = useState<string | null>(null);

  const favoriteStores = (allStores ?? []).filter((s) => favoriteIds.has(s.id));
  const storesByCategory = groupByCategory(favoriteStores);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <ScreenContainer title="My Cart" subtitle="Your Picks, Your Way.">
      <WalletGlassCard balance={wallet?.balance ?? 0} ownerLabel="RPX Wallet" />

      {cartLines.length > 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
            You have added {cartLines.length} item{cartLines.length === 1 ? "" : "s"} · Total in list summary
          </Text>
          <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.brandPrimary }}>
            ₱{cartTotal.toFixed(0)}
          </Text>
        </View>
      ) : null}

      {loading ? <Loading label="Loading your saved stores…" /> : null}
      {error ? <ErrorState description={error} onRetry={refetch} /> : null}

      {!loading && !error && favoriteStores.length === 0 ? (
        <EmptyState title="No saved stores yet" description="Tap the heart on any store to save it here." />
      ) : null}

      {Object.entries(storesByCategory).map(([category, stores]) => (
        <View key={category} style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Text style={{ fontSize: theme.typography.fontSize.xs, fontWeight: "800", letterSpacing: 1, color: theme.colors.brandPrimary }}>
              ◆ {category.toUpperCase()} ◆
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </View>

          {stores.map((store) => (
            <Pressable
              key={store.id}
              onPress={() => setOpenStoreId(store.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 22 }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "700", color: theme.colors.textPrimary }}>
                  {store.name}
                </Text>
                <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  {store.distanceLabel} · {store.deliveryTimeLabel}
                </Text>
              </View>
              <Badge label={store.isOpen ? "Open" : "Closed"} tone={store.isOpen ? "success" : "neutral"} />
              <Text style={{ color: theme.colors.textSecondary }}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}

      <StoreCartModal
        storeId={openStoreId}
        onClose={() => setOpenStoreId(null)}
        onProceed={() => {
          setOpenStoreId(null);
          if (cartLines.length === 0) return;
          navigation.navigate("Checkout", undefined);
        }}
      />
    </ScreenContainer>
  );
}

function groupByCategory(stores: StoreSummary[]): Record<string, StoreSummary[]> {
  return stores.reduce<Record<string, StoreSummary[]>>((groups, store) => {
    const key = store.category || "Other";
    groups[key] = groups[key] ? [...groups[key], store] : [store];
    return groups;
  }, {});
}
