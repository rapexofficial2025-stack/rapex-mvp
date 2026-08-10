import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import { useIncentiveProgress } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Incentives">;

export function IncentivesScreen({}: Props) {
  const theme = useAppTheme();
  const { data: incentive, loading, error, refetch } = useIncentiveProgress();

  if (loading) return <Loading />;
  if (error || !incentive) return <ErrorState description={error ?? "Could not load incentive progress."} onRetry={refetch} />;

  const progressPercent = Math.min(100, Math.round((incentive.completedDeliveries / incentive.targetDeliveries) * 100));

  return (
    <ScreenContainer title="Weekly Incentive" subtitle="Complete 60 deliveries Monday-Sunday to earn ₱500">
      <GlassCard>
        <Badge label={incentive.achieved ? "TARGET REACHED" : "IN PROGRESS"} tone={incentive.achieved ? "success" : "warning"} />
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", marginTop: theme.spacing.sm }}>
          {incentive.completedDeliveries} / {incentive.targetDeliveries}
        </Text>
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.colors.surfaceAlt,
            marginTop: theme.spacing.sm,
            overflow: "hidden",
          }}
        >
          <View style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: theme.colors.brandPrimary }} />
        </View>
        <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>
          Reward: {formatPeso(incentive.rewardAmount || 500)} {incentive.achieved ? "(earned this week)" : "if target is reached"}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
          Week: {new Date(incentive.weekStart).toLocaleDateString()} - {new Date(incentive.weekEnd).toLocaleDateString()}
        </Text>
      </GlassCard>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
        Only completed deliveries count. Cancelled and failed deliveries are excluded, and the count resets every Monday.
      </Text>
    </ScreenContainer>
  );
}
