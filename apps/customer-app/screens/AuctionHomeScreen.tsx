import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { AuctionCard } from "../components/AuctionCard";
import { MOCK_AUCTIONS } from "../services/mockAuctions";
import type { AuctionCategory } from "../types/auction";

type Props = NativeStackScreenProps<RootStackParamList, "AuctionHome">;

const SORT_TABS = ["Live", "Ending Soon", "Newest", "Highest Bid", "Watchlist"] as const;
type SortTab = (typeof SORT_TABS)[number];

const CATEGORIES: AuctionCategory[] = ["Electronics", "Collectibles", "Fashion", "Home & Living", "Vehicles", "Other"];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
          borderRadius: theme.radius.full,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text style={{ color: active ? theme.colors.textInverse : theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AuctionHomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [sortTab, setSortTab] = useState<SortTab>("Live");
  const [category, setCategory] = useState<AuctionCategory | null>(null);

  const auctions = useMemo(() => {
    let list = MOCK_AUCTIONS;
    if (category) list = list.filter((a) => a.category === category);
    if (sortTab === "Ending Soon") list = list.filter((a) => a.status === "ending-soon");
    if (sortTab === "Watchlist") list = list.filter((a) => a.isWatchlisted);
    if (sortTab === "Highest Bid") list = [...list].sort((a, b) => b.currentBid - a.currentBid);
    return list;
  }, [sortTab, category]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
          Auctions
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SORT_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => <Chip label={item} active={sortTab === item} onPress={() => setSortTab(item)} />}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: theme.spacing.xs }}
          renderItem={({ item }) => (
            <Chip label={item} active={category === item} onPress={() => setCategory(category === item ? null : item)} />
          )}
        />
      </View>
      <FlatList
        data={auctions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        renderItem={({ item }) => (
          <AuctionCard auction={item} onPress={() => navigation.navigate("AuctionDetails", { auctionId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: theme.colors.textSecondary, marginTop: theme.spacing.xl }}>
            No auctions match this filter.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
  },
});
