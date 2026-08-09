import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, ErrorState, GlassCard, Loading } from "@rapex/ui-native";
import {
  useAsyncAction,
  useCurrentOffer,
  useRepositories,
  useRiderEarnings,
  useRiderProfile,
} from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Home">, NativeStackScreenProps<RootStackParamList>>;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { rider, delivery } = useRepositories();
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useRiderProfile();
  const { data: earnings, loading: earningsLoading } = useRiderEarnings();
  const { data: offer, refetch: refetchOffer } = useCurrentOffer();

  const toggleOnline = useAsyncAction((next: boolean) => rider!.setAvailabilityStatus(next ? "online" : "offline"));
  const acceptOffer = useAsyncAction((offerId: string) => delivery!.acceptOffer(offerId));
  const rejectOffer = useAsyncAction((offerId: string) => delivery!.rejectOffer(offerId));

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for a new assignment offer every few seconds while online -- stands in for the
  // real-time push channel (Firebase) the assignment engine will use once wired up.
  useEffect(() => {
    if (profile?.availabilityStatus !== "online") return;
    pollRef.current = setInterval(() => refetchOffer(), 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [profile?.availabilityStatus, refetchOffer]);

  useEffect(() => {
    if (!offer) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(offer.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) refetchOffer();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offer, refetchOffer]);

  const handleAccept = useCallback(async () => {
    if (!offer) return;
    await acceptOffer.execute(offer.offerId);
    navigation.navigate("Delivery");
  }, [offer, acceptOffer, navigation]);

  const handleReject = useCallback(async () => {
    if (!offer) return;
    await rejectOffer.execute(offer.offerId);
    refetchOffer();
  }, [offer, rejectOffer, refetchOffer]);

  if (profileLoading) return <Loading />;
  if (profileError || !profile) return <ErrorState description={profileError ?? "Could not load rider profile."} onRetry={refetchProfile} />;

  const isOnline = profile.availabilityStatus === "online";

  return (
    <ScreenContainer title={`Hi, ${profile.fullName.split(" ")[0]}`} subtitle="Ready to deliver today?">
      <View style={{ alignItems: "flex-start", marginBottom: theme.spacing.sm }}>
        <Badge label="Mock data — backend endpoint required" tone="warning" />
      </View>
      <GlassCard>
        <View style={styles.row}>
          <View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.lg, fontWeight: "700" }}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Badge label={profile.verificationStatus.toUpperCase()} tone={profile.verificationStatus === "verified" ? "success" : "warning"} />
          </View>
          <Switch
            value={isOnline}
            disabled={profile.verificationStatus !== "verified" || toggleOnline.loading}
            onValueChange={async (next) => {
              await toggleOnline.execute(next);
              refetchProfile();
            }}
          />
        </View>
      </GlassCard>

      {offer ? (
        <GlassCard style={{ borderColor: theme.colors.brandPrimary }}>
          <Text style={{ color: theme.colors.brandPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.lg }}>
            New Delivery Request ({secondsLeft ?? offer.secondsToRespond}s)
          </Text>
          <Text style={{ color: theme.colors.textPrimary, marginTop: theme.spacing.xs }}>{offer.merchantName}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{offer.merchantAddress}</Text>
          <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
            Pickup {offer.pickupDistanceKm.toFixed(1)} km · Delivery {offer.deliveryDistanceKm.toFixed(1)} km ·{" "}
            {offer.estimatedTimeMinutes} min · {offer.itemCount} item(s)
          </Text>
          <Text style={{ color: theme.colors.textPrimary, marginTop: theme.spacing.xs }}>
            Delivery Fee: {formatPeso(offer.deliveryFee)}
          </Text>
          <Text style={{ color: theme.colors.success, fontWeight: "700" }}>
            Est. earnings: {formatPeso(offer.estimatedRiderEarnings)}
          </Text>
          <View style={[styles.row, { marginTop: theme.spacing.md }]}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <Button label="Reject" variant="outline" loading={rejectOffer.loading} onPress={handleReject} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Accept" loading={acceptOffer.loading} onPress={handleAccept} />
            </View>
          </View>
        </GlassCard>
      ) : null}

      <GlassCard>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Today's Earnings</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize["2xl"], fontWeight: "700" }}>
          {earningsLoading || !earnings ? "..." : formatPeso(earnings.todayEarnings)}
        </Text>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
