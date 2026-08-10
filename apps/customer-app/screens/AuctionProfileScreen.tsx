import { View, Text } from "react-native";
import { Badge } from "@rapex/ui-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

const SECTIONS: { label: string; count: number; tone: "success" | "error" | "info" | "neutral" | "brand" }[] = [
  { label: "Won Auctions", count: 3, tone: "success" },
  { label: "Lost Auctions", count: 5, tone: "error" },
  { label: "Watching", count: 4, tone: "brand" },
  { label: "Selling", count: 1, tone: "info" },
  { label: "History", count: 12, tone: "neutral" },
];

export function AuctionProfileScreen() {
  const theme = useAppTheme();

  return (
    <ScreenContainer title="My Auctions" subtitle="Your bidding and selling activity">
      <View style={{ gap: theme.spacing.sm }}>
        {SECTIONS.map((section) => (
          <View
            key={section.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
            }}
          >
            <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary, fontWeight: "600" }}>
              {section.label}
            </Text>
            <Badge label={String(section.count)} tone={section.tone} />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
