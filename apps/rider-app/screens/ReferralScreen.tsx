import { FlatList, Image, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import { useReferralSummary } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Referral">;

export function ReferralScreen({}: Props) {
  const theme = useAppTheme();
  const { data: referral, loading, error, refetch } = useReferralSummary();

  if (loading) return <Loading />;
  if (error || !referral) return <ErrorState description={error ?? "Could not load referral program."} onRetry={refetch} />;

  return (
    <ScreenContainer title="Referral Program" subtitle="Earn points by inviting new riders">
      <GlassCard style={{ alignItems: "center" }}>
        <Image source={{ uri: referral.qrCodeDataUrl }} style={{ width: 140, height: 140 }} />
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.lg, marginTop: theme.spacing.sm }}>
          {referral.referralCode}
        </Text>
      </GlassCard>

      <GlassCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.textSecondary }}>Invited</Text>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>{referral.invitedCount}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.textSecondary }}>Approved</Text>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>{referral.approvedCount}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.textSecondary }}>Points This Month</Text>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>
            {referral.pointsThisMonth} / {referral.maxPointsPerMonth}
          </Text>
        </View>
      </GlassCard>

      <View>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginBottom: theme.spacing.xs }}>History</Text>
        <FlatList
          data={referral.history}
          keyExtractor={(item, index) => `${item.riderName}-${index}`}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: theme.spacing.xs }}>
              <Text style={{ color: theme.colors.textPrimary }}>{item.riderName}</Text>
              <Badge label={item.status} tone={item.status === "approved" ? "success" : "neutral"} />
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
