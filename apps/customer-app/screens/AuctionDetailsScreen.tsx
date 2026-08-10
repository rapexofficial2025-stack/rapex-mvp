import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";
import { MOCK_AUCTION_DETAILS } from "../services/mockAuctions";

type Props = NativeStackScreenProps<RootStackParamList, "AuctionDetails">;

function Row({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

export function AuctionDetailsScreen({ route }: Props) {
  const theme = useAppTheme();
  const auction = MOCK_AUCTION_DETAILS[route.params.auctionId];

  if (!auction) {
    return <ScreenContainer title="Auction Not Found" />;
  }

  return (
    <ScreenContainer title={auction.title} subtitle={`Seller: ${auction.sellerName}`}>
      <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
        <Badge label={`${auction.photoCount} photos`} tone="neutral" />
        <Badge label={auction.condition} tone="neutral" />
        <Badge label={auction.status === "ending-soon" ? "Ending Soon" : "Live"} tone={auction.status === "ending-soon" ? "warning" : "success"} />
      </View>

      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>{auction.description}</Text>

      <View
        style={{
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.xs,
        }}
      >
        <Row label="Current Bid" value={formatPeso(auction.currentBid)} />
        <Row label="Minimum Increment" value={formatPeso(auction.minIncrement)} />
        <Row label="Time Left" value={auction.endsInLabel} />
        <Row label="Number of Bidders" value={String(auction.bidderCount)} />
      </View>

      <Button label={`Place Bid (min. ${formatPeso(auction.currentBid + auction.minIncrement)})`} onPress={() => {}} />

      <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginTop: theme.spacing.md }}>
        Bid History
      </Text>
      <View style={{ gap: theme.spacing.xs }}>
        {auction.bidHistory.map((bid) => (
          <View
            key={bid.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.sm,
            }}
          >
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>{bid.bidderName}</Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm, fontWeight: "600" }}>
              {formatPeso(bid.amount)}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>{bid.timeLabel}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
