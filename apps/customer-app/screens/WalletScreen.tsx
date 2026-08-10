import { FlatList, Text, View } from "react-native";
import { Loading, ErrorState } from "@rapex/ui-native";
import { formatPeso, formatDateTime } from "@rapex/utils";
import { useWalletSummary } from "@rapex/api-client";
import { useAppTheme } from "../hooks/useAppTheme";

export function WalletScreen() {
  const theme = useAppTheme();
  const { data: wallet, loading, error, refetch } = useWalletSummary();

  if (loading) return <Loading label="Loading wallet…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!wallet) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Wallet Balance</Text>
        <Text style={{ fontSize: theme.typography.fontSize["3xl"], fontWeight: "700", color: theme.colors.brandPrimary }}>
          {formatPeso(wallet.balance)}
        </Text>
      </View>
      <FlatList
        data={wallet.transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        ListHeaderComponent={
          <Text style={{ fontSize: theme.typography.fontSize.base, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
            Transactions
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
            }}
          >
            <View>
              <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary, fontWeight: "600" }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                {formatDateTime(item.occurredAt)}
              </Text>
            </View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: "700",
                color: item.direction === "credit" ? theme.colors.success : theme.colors.error,
              }}
            >
              {item.direction === "credit" ? "+" : "-"}
              {formatPeso(item.amount)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
