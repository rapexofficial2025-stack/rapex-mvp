import { Pressable, Text, View } from "react-native";
import { GlassCard, Skeleton } from "@rapex/ui-native";
import { formatPeso } from "@rapex/utils";
import { useWalletSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

type WalletSummaryCardProps = {
  onPress: () => void;
};

export function WalletSummaryCard({ onPress }: WalletSummaryCardProps) {
  const theme = useAppTheme();
  const { data: wallet, loading } = useWalletSummary();

  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: theme.spacing.lg }}>
      <GlassCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ gap: theme.spacing.xxs }}>
            <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
              Wallet Balance
            </Text>
            {loading ? (
              <Skeleton width={100} height={24} />
            ) : (
              <Text style={{ fontSize: theme.typography.fontSize.xl, fontWeight: "700", color: theme.colors.brandPrimary }}>
                {formatPeso(wallet?.balance ?? 0)}
              </Text>
            )}
          </View>
          <Text style={{ fontSize: theme.typography.fontSize.sm, fontWeight: "600", color: theme.colors.accent }}>
            View Wallet →
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}
