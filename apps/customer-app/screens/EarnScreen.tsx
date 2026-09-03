import { Platform, Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Badge, Button, GlassCard, Loading, useToast } from "@rapex/ui-native";
import { useAsync, useRepositories } from "@rapex/api-client";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

/**
 * docs/business/Referral.md and Rewards.md are both still "Not yet
 * defined -- to be filled in during the Xano backend design conversation."
 * There is no confirmed points/referral rule for customers (unlike rider,
 * which has a defined Referral Engine in docs/business/Rider.md). Rather
 * than invent numbers, this screen only shows what's actually real: a
 * referral code derived from the logged-in account, and a working native
 * Share action. Points/rewards balance is explicitly labeled as not
 * backed by any confirmed endpoint.
 */
export function EarnScreen() {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const { data: user, loading } = useAsync(() => auth.getCurrentUser(), []);
  const { showToast } = useToast();

  if (loading) return <Loading label="Loading…" />;

  const referralCode = user ? buildReferralCode(user.email || user.id) : "RAPEX-----";

  return (
    <ScreenContainer title="Earn" subtitle="Referrals & Rewards">
      <Badge label="Rewards/referral rules not finalized yet — mock UI only" tone="warning" />

      <GlassCard style={{ alignItems: "center" }}>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Your Referral Code</Text>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.brandPrimary, letterSpacing: 2, marginTop: 4 }}>
          {referralCode}
        </Text>
        <View style={{ marginTop: theme.spacing.md, backgroundColor: "#FFFFFF", padding: theme.spacing.sm, borderRadius: 12 }}>
          <QRCode value={`rapexcustomer://referral/${referralCode}`} size={160} />
        </View>
        <View style={{ marginTop: theme.spacing.md, width: "100%" }}>
          <Button
            label="Share Referral Code"
            onPress={async () => {
              const message = `Join RAPEX and get your first delivery on us! Use my code ${referralCode} when you sign up.`;
              if (Platform.OS === "web") {
                showToast("Sharing isn't available on web yet — copy your code manually.");
                return;
              }
              try {
                await Share.share({ message });
              } catch {
                showToast("Couldn't open the share sheet.", "error");
              }
            }}
          />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Rewards Points</Text>
        <Text style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: "700", color: theme.colors.textPrimary, marginTop: 4 }}>
          0
        </Text>
        <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
          No confirmed Xano endpoint for points/rewards yet — always 0 until the Rewards Engine business rules and backend contract are defined.
        </Text>
      </GlassCard>
    </ScreenContainer>
  );
}

function buildReferralCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `RAPEX-${(hash % 100000).toString().padStart(5, "0")}`;
}
