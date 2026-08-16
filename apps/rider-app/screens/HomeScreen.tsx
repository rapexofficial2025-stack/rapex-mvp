import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, MessageCircle, Menu, Compass, Layers, Plus, ChevronRight, Package, Wallet as WalletIcon, Star, History, LifeBuoy, ShieldCheck } from "lucide-react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, ErrorState, GlassCard, Loading, RapexGlassCard } from "@rapex/ui-native";
import {
  useAsyncAction,
  useCurrentOffer,
  useIncentiveProgress,
  useRepositories,
  useRiderEarnings,
  useRiderProfile,
  useRiderWalletSummary,
} from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Home">, NativeStackScreenProps<RootStackParamList>>;

/**
 * Rebuilt to match the reference design (map header + profile/wallet card +
 * status toggle + stat row + quick actions + incentives banner). Every
 * number shown comes from a real hook where one exists (profile, earnings,
 * wallet, incentives, online toggle, current offer) -- nothing here invents
 * data. Two things are explicitly NOT backed by any endpoint yet and are
 * labeled as such rather than faked: "Auto Pick" and "Work Time" have no
 * rider-settings contract defined yet, so they're local-only UI for now.
 * The map is RapexMapView if a Google Maps key is configured
 * (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY), otherwise a static placeholder --
 * see packages/ui-native/src/RapexMapView.tsx for why that's not "real" yet
 * even when it renders (no live GPS/backend location data either way).
 */
export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { rider, delivery } = useRepositories();
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useRiderProfile();
  const { data: earnings } = useRiderEarnings();
  const { data: wallet } = useRiderWalletSummary();
  const { data: incentive } = useIncentiveProgress();
  const { data: offer, refetch: refetchOffer } = useCurrentOffer();

  const toggleOnline = useAsyncAction((next: boolean) => rider!.setAvailabilityStatus(next ? "online" : "offline"));
  const acceptOffer = useAsyncAction((offerId: string) => delivery!.acceptOffer(offerId));
  const rejectOffer = useAsyncAction((offerId: string) => delivery!.rejectOffer(offerId));

  const [autoPick, setAutoPick] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  const ordersOngoing = offer ? 1 : 0; // Rider model is single-active-delivery right now, not a queue -- see MockDeliveryRepository.

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      {/* Map header -- placeholder gradient until a real Google Maps API key + live GPS exist. */}
      <View style={styles.mapArea}>
        <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder]} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.mapHeaderRow}>
            <Pressable style={styles.mapIconButton}>
              <Menu color="#FFFFFF" size={20} />
            </Pressable>
            <Text style={styles.mapLogoText}>RAPEX</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable style={styles.mapIconButton}>
                <Bell color="#FFFFFF" size={18} />
              </Pressable>
              <Pressable style={styles.mapIconButton}>
                <MessageCircle color="#FFFFFF" size={18} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.onlinePillWrap}>
          <View style={[styles.onlinePill, { backgroundColor: isOnline ? "rgba(34,197,94,0.9)" : "rgba(107,114,128,0.9)" }]}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlinePillText}>{isOnline ? "You're Online" : "You're Offline"}</Text>
          </View>
        </View>

        <View style={styles.mapSideButtons}>
          <Pressable style={styles.mapIconButton}>
            <Compass color="#FFFFFF" size={18} />
          </Pressable>
          <Pressable style={styles.mapIconButton}>
            <Layers color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 32 }}>
        <View style={{ alignItems: "flex-start" }}>
          <Badge label="Some fields are local-only (Auto Pick, Work Time) -- no rider-settings endpoint yet" tone="warning" />
        </View>

        {/* Profile + Wallet row */}
        <View style={styles.row}>
          <GlassCard style={{ flex: 1.3 }}>
            <View style={styles.row}>
              <View style={styles.avatarCircle}>
                <Text style={{ color: theme.colors.brandPrimary, fontWeight: "800", fontSize: theme.typography.fontSize.lg }}>
                  {profile.fullName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }} numberOfLines={1}>
                    {profile.fullName}
                  </Text>
                  {profile.verificationStatus === "verified" ? <ShieldCheck color={theme.colors.success} size={14} /> : null}
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>Rider ID: {profile.id}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Star color={theme.extended.peach} fill={theme.extended.peach} size={12} />
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>{profile.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <Pressable onPress={() => navigation.navigate("Wallet")} style={{ flex: 1 }}>
            <RapexGlassCard tone="dark" glow={false} style={{ marginLeft: theme.spacing.sm }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: theme.typography.fontSize.xs }}>RAPEX Wallet</Text>
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: theme.typography.fontSize.lg }}>
                    {wallet ? formatPeso(wallet.operationalBalance + wallet.incomeBalance) : "..."}
                  </Text>
                </View>
                <View style={styles.walletPlus}>
                  <Plus color="#FFFFFF" size={14} />
                </View>
              </View>
            </RapexGlassCard>
          </Pressable>
        </View>

        {/* Auto Pick / Work Time -- local-only, not backend-wired */}
        <View style={styles.row}>
          <GlassCard style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>Auto Pick</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
              Automatically receive nearby orders
            </Text>
            <Switch value={autoPick} onValueChange={setAutoPick} style={{ marginTop: theme.spacing.xs, alignSelf: "flex-start" }} />
          </GlassCard>
          <GlassCard style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>Work Time</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
              Set your available work schedule
            </Text>
            <View style={{ marginTop: theme.spacing.xs, alignSelf: "flex-start", opacity: 0.5 }}>
              <Badge label="Set Time (coming soon)" tone="warning" />
            </View>
          </GlassCard>
        </View>

        {/* Online toggle -- the one real, working action from before. */}
        <RapexGlassCard tone="dark" glow={false}>
          <View style={styles.row}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <View style={[styles.onlineDot, { backgroundColor: isOnline ? "#22C55E" : "#6B7280" }]} />
              <View>
                <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                  You are <Text style={{ color: isOnline ? "#4ADE80" : "#9CA3AF" }}>{isOnline ? "Online" : "Offline"}</Text>
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: theme.typography.fontSize.xs }}>
                  {isOnline ? "You will receive orders" : "Go online to start receiving orders"}
                </Text>
              </View>
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
        </RapexGlassCard>

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
            <Text style={{ color: theme.colors.textPrimary, marginTop: theme.spacing.xs }}>Delivery Fee: {formatPeso(offer.deliveryFee)}</Text>
            <Text style={{ color: theme.colors.success, fontWeight: "700" }}>Est. earnings: {formatPeso(offer.estimatedRiderEarnings)}</Text>
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

        {/* Stat row */}
        <View style={styles.row}>
          <GlassCard style={{ flex: 1 }}>
            <View style={[styles.statIconBadge, { backgroundColor: theme.colors.brandPrimary + "22" }]}>
              <Package color={theme.colors.brandPrimary} size={16} />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 6 }}>Orders Ongoing</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "800", fontSize: theme.typography.fontSize.lg }}>{ordersOngoing}</Text>
          </GlassCard>
          <GlassCard style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <View style={[styles.statIconBadge, { backgroundColor: theme.extended.peach + "33" }]}>
              <WalletIcon color={theme.extended.peach} size={16} />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 6 }}>Today's Earnings</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "800", fontSize: theme.typography.fontSize.lg }}>
              {earnings ? formatPeso(earnings.todayEarnings) : "..."}
            </Text>
          </GlassCard>
          <GlassCard style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <View style={[styles.statIconBadge, { backgroundColor: "#3B82F633" }]}>
              <WalletIcon color="#3B82F6" size={16} />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs, marginTop: 6 }}>Wallet Balance</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: "800", fontSize: theme.typography.fontSize.lg }}>
              {wallet ? formatPeso(wallet.operationalBalance) : "..."}
            </Text>
          </GlassCard>
        </View>

        {/* Quick actions */}
        <View style={styles.row}>
          <QuickAction icon={<History color={theme.colors.brandPrimary} size={18} />} label="Order History" onPress={() => navigation.navigate("Earnings")} />
          <QuickAction icon={<WalletIcon color={theme.extended.peach} size={18} />} label="Earnings" onPress={() => navigation.navigate("Earnings")} />
          <QuickAction icon={<Star color="#EAB308" size={18} />} label="Ratings" onPress={() => navigation.navigate("Profile")} />
          <QuickAction icon={<LifeBuoy color="#3B82F6" size={18} />} label="Help Center" onPress={() => {}} />
        </View>

        {/* Incentives banner */}
        <Pressable onPress={() => navigation.navigate("Incentives")}>
          <RapexGlassCard tone="dark">
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>More Deliveries, More Earnings!</Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: theme.typography.fontSize.xs, marginTop: 2 }}>
                  {incentive
                    ? `${incentive.completedDeliveries}/${incentive.targetDeliveries} deliveries this week -- ${formatPeso(incentive.rewardAmount)} reward`
                    : "Stay online to get more orders and earn incentives."}
                </Text>
                <View style={{ marginTop: theme.spacing.sm, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ color: theme.extended.peach, fontWeight: "700", fontSize: theme.typography.fontSize.sm }}>View Incentives</Text>
                  <ChevronRight color={theme.extended.peach} size={14} />
                </View>
              </View>
            </View>
          </RapexGlassCard>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center" }}>
      <GlassCard style={{ width: "100%", alignItems: "center", paddingVertical: theme.spacing.sm }}>
        {icon}
        <Text style={{ color: theme.colors.textPrimary, fontSize: 10, fontWeight: "600", marginTop: 6, textAlign: "center" }}>{label}</Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mapArea: {
    height: 320,
  },
  mapPlaceholder: {
    backgroundColor: "#2B2140",
  },
  mapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  mapIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapLogoText: { color: "#FFFFFF", fontWeight: "800", fontSize: 18, letterSpacing: 1 },
  onlinePillWrap: { position: "absolute", left: 16, bottom: 90 },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  onlinePillText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  mapSideButtons: { position: "absolute", right: 16, bottom: 90, gap: 8 },
  sheet: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(139,92,246,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
