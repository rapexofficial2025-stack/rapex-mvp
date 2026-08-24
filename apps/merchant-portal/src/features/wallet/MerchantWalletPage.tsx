import { useState, type CSSProperties } from "react";
import { Badge, Button, ErrorState, Loading, useTheme } from "@rapex/ui-web";
import { useAsync, useRepositories } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";

/**
 * Deliberately simple, one-task-per-screen "GCash style" layout -- most
 * RAPEX merchants are phone-only local vendors (carinderia, food carts,
 * wet market stalls) who are not techy, per founder instruction
 * (2026-08-20). No sidebar/multi-column chrome here on purpose; this is
 * meant to work as the merchant mobile wallet even though it renders fine
 * on desktop too.
 *
 * Uses the same generic WalletRepository every other role already uses
 * (see CheckoutScreen.tsx in customer-app) -- already wired into
 * AppProviders.tsx via createMockRepositories(), just never consumed by
 * any merchant-portal screen until now. Top Up has no confirmed Xano
 * merchant-wallet endpoint yet, so it stays an honest "not connected"
 * notice instead of a fake top-up.
 */
export function MerchantWalletPage() {
  const theme = useTheme();
  const { wallet } = useRepositories();
  const { data: summary, loading, error, refetch } = useAsync(() => wallet.getWalletSummary(), []);
  const [notice, setNotice] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !summary) return <ErrorState description={error ?? "Could not load wallet."} onRetry={refetch} />;

  return (
    <div style={styles.page}>
      <h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>Wallet</h1>

      <div style={{ ...styles.balanceCard, background: theme.colors.brandPrimary }}>
        <span style={styles.balanceLabel}>Available Balance</span>
        <span style={styles.balanceAmount}>{formatPeso(summary.balance)}</span>
      </div>

      <div style={styles.actionRow}>
        <div style={{ flex: 1 }}>
          <Button
            label="Top Up"
            onClick={() => setNotice("Top-up needs a confirmed Xano merchant-wallet endpoint -- not connected yet.")}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Button
            label="Cash Out"
            variant="secondary"
            onClick={() => setNotice("Cash-out needs a confirmed Xano merchant-wallet endpoint -- not connected yet.")}
          />
        </div>
      </div>
      {notice ? <Badge label={notice} tone="neutral" /> : null}

      <h2 style={{ ...styles.sectionTitle, color: theme.colors.textPrimary }}>Recent Activity</h2>
      {summary.transactions.length === 0 ? (
        <p style={{ color: theme.colors.textSecondary }}>No transactions yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {summary.transactions.map((transaction) => (
            <div key={transaction.id} style={{ ...styles.transactionRow, borderColor: theme.colors.border, background: theme.colors.surface }}>
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{transaction.label}</span>
              <span style={{ color: transaction.direction === "credit" ? theme.colors.success : theme.colors.error, fontWeight: 700 }}>
                {transaction.direction === "credit" ? "+" : "-"}
                {formatPeso(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 480, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  balanceCard: { borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 6 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 },
  balanceAmount: { color: "#FFFFFF", fontSize: 34, fontWeight: 800 },
  actionRow: { display: "flex", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, margin: "8px 0 0" },
  transactionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: "1px solid" },
};
