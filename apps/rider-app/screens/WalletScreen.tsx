import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, ErrorState, GlassCard, Input, Loading } from "@rapex/ui-native";
import { useAsyncAction, useRepositories, useRiderWalletSummary } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, "Wallet">, NativeStackScreenProps<RootStackParamList>>;

export function WalletScreen({}: Props) {
  const theme = useAppTheme();
  const { riderWallet } = useRepositories();
  const { data: wallet, loading, error, refetch } = useRiderWalletSummary();
  const [topUpAmount, setTopUpAmount] = useState("");
  const [remitAmount, setRemitAmount] = useState("");
  const topUp = useAsyncAction((amount: number) => riderWallet!.topUpOperational(amount));
  const remit = useAsyncAction((amount: number) => riderWallet!.requestRemittance(amount));

  if (loading) return <Loading />;
  if (error || !wallet) return <ErrorState description={error ?? "Could not load wallet."} onRetry={refetch} />;

  const belowMinimum = wallet.operationalBalance < wallet.minimumOperationalBalance;

  return (
    <ScreenContainer title="Wallet" subtitle="Operational and income balances">
      <GlassCard>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Operational Wallet</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize["2xl"], fontWeight: "700" }}>
          {formatPeso(wallet.operationalBalance)}
        </Text>
        {belowMinimum ? <Badge label="Below minimum -- top up to accept deliveries" tone="error" /> : null}
        <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
          <Input label="Top-up amount" keyboardType="number-pad" value={topUpAmount} onChangeText={setTopUpAmount} />
          {topUp.error ? <ErrorState description={topUp.error} /> : null}
          <Button
            label="Top Up"
            loading={topUp.loading}
            onPress={async () => {
              await topUp.execute(Number(topUpAmount));
              setTopUpAmount("");
              refetch();
            }}
          />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Income Wallet</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize["2xl"], fontWeight: "700" }}>
          {formatPeso(wallet.incomeBalance)}
        </Text>
        <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
          <Input label="Remittance amount" keyboardType="number-pad" value={remitAmount} onChangeText={setRemitAmount} />
          {remit.error ? <ErrorState description={remit.error} /> : null}
          <Button
            label="Remit to Bank / E-Wallet"
            variant="secondary"
            loading={remit.loading}
            onPress={async () => {
              await remit.execute(Number(remitAmount));
              setRemitAmount("");
              refetch();
            }}
          />
        </View>
      </GlassCard>

      <View>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginBottom: theme.spacing.xs }}>History</Text>
        <FlatList
          data={wallet.transactions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: theme.spacing.xs }}>
              <Text style={{ color: theme.colors.textPrimary }}>{item.label}</Text>
              <Text style={{ color: item.direction === "credit" ? theme.colors.success : theme.colors.error }}>
                {item.direction === "credit" ? "+" : "-"}
                {formatPeso(item.amount)}
              </Text>
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
