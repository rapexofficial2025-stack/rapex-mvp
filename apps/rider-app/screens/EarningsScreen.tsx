import { Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import { useIncentiveProgress, useRiderEarnings } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Earnings">, NativeStackScreenProps<RootStackParamList>>;

function StatRow({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: theme.spacing.xs }}>
      <Text style={{ color: theme.colors.textSecondary }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

export function EarningsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { data: earnings, loading, error, refetch } = useRiderEarnings();
  const { data: incentive } = useIncentiveProgress();

  if (loading) return <Loading />;
  if (error || !earnings) return <ErrorState description={error ?? "Could not load earnings."} onRetry={refetch} />;

  return (
    <ScreenContainer title="Earnings" subtitle="Your delivery income at a glance">
      <GlassCard>
        <StatRow label="Today" value={formatPeso(earnings.todayEarnings)} />
        <StatRow label="This Week" value={formatPeso(earnings.weeklyEarnings)} />
        <StatRow label="This Month" value={formatPeso(earnings.monthlyEarnings)} />
        <StatRow label="Lifetime" value={formatPeso(earnings.lifetimeEarnings)} />
      </GlassCard>

      <GlassCard>
        <StatRow label="Delivery Count" value={String(earnings.deliveryCount)} />
        <StatRow label="Average per Delivery" value={formatPeso(earnings.averageEarningsPerDelivery)} />
        <StatRow label="Total Distance" value={`${earnings.totalDistanceKm.toFixed(1)} km`} />
        <StatRow label="Average Delivery Time" value={`${earnings.averageDeliveryTimeMinutes} min`} />
      </GlassCard>

      {incentive ? (
        <GlassCard>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>Weekly Incentive</Text>
          <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
            {incentive.completedDeliveries}/{incentive.targetDeliveries} deliveries this week
          </Text>
          <Button label="View Incentive Details" variant="secondary" onPress={() => navigation.navigate("Incentives")} />
        </GlassCard>
      ) : null}
    </ScreenContainer>
  );
}
