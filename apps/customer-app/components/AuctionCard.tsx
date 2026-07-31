import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import type { AuctionListing } from "../types/auction";
import { useAppTheme } from "../hooks/useAppTheme";

type AuctionCardProps = {
  auction: AuctionListing;
  onPress: () => void;
};

export function AuctionCard({ auction, onPress }: AuctionCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.xxs,
        },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, flex: 1 }}>
          {auction.title}
        </Text>
        {auction.isWatchlisted ? <Badge label="★ Watching" tone="brand" /> : null}
      </View>
      <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        {auction.category} · {auction.sellerName}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: theme.spacing.xs }}>
        <View>
          <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>Current Bid</Text>
          <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.brandPrimary }}>
            {formatPeso(auction.currentBid)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Badge label={auction.status === "ending-soon" ? "Ending Soon" : "Live"} tone={auction.status === "ending-soon" ? "warning" : "success"} />
          <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }}>
            {auction.endsInLabel} · {auction.bidderCount} bidders
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
