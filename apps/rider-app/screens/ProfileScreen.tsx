import { Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Avatar, Badge, Button, ErrorState, GlassCard, Loading, ThemeToggle } from "@rapex/ui-native";
import { useAsyncAction, useRepositories, useRiderPerformance, useRiderProfile } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Profile">, NativeStackScreenProps<RootStackParamList>>;

export function ProfileScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const { data: profile, loading, error, refetch } = useRiderProfile();
  const { data: performance } = useRiderPerformance();
  const logout = useAsyncAction(() => auth.logout());

  if (loading) return <Loading />;
  if (error || !profile) return <ErrorState description={error ?? "Could not load profile."} onRetry={refetch} />;

  return (
    <ScreenContainer title="Profile">
      <GlassCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <Avatar name={profile.fullName} size="lg" />
          <View>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.lg }}>
              {profile.fullName}
            </Text>
            <Badge label={profile.vehicleType.toUpperCase()} tone="brand" />
          </View>
        </View>
        <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>{profile.phone}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{profile.email}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          {profile.barangay}, {profile.municipality}, {profile.province}
        </Text>
      </GlassCard>

      {performance ? (
        <GlassCard>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginBottom: theme.spacing.sm }}>Performance</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Rating: {performance.averageRating.toFixed(2)} ★</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Acceptance Rate: {performance.acceptanceRatePercent}%</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Completion Rate: {performance.completionRatePercent}%</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Lifetime Deliveries: {performance.lifetimeDeliveries}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>Lifetime Earnings: {formatPeso(performance.lifetimeEarnings)}</Text>
        </GlassCard>
      ) : null}

      <GlassCard>
        <ThemeToggle />
      </GlassCard>

      <Button label="Edit Profile" onPress={() => navigation.navigate("EditProfile")} />
      <Button label="Verification Status" variant="secondary" onPress={() => navigation.navigate("Verification")} />
      <Button label="Weekly Incentive" variant="secondary" onPress={() => navigation.navigate("Incentives")} />
      <Button label="Referral Program" variant="secondary" onPress={() => navigation.navigate("Referral")} />
      <Button label="Log Out" variant="danger" loading={logout.loading} onPress={() => logout.execute()} />
    </ScreenContainer>
  );
}
