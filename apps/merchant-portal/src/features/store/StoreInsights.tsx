import { EmptyState, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import { useStoreInsights, type MerchantStore } from "@rapex/api-client";

type StoreInsightsProps = {
  store: MerchantStore;
};

export function StoreInsights({ store }: StoreInsightsProps) {
  const theme = useTheme();
  const { data: insights, loading, error, refetch } = useStoreInsights(store.id);

  if (loading) return <Loading label="Crunching store insights…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!insights) return null;

  const maxDailyRevenue = Math.max(1, ...insights.last7DaysRevenue.map((d) => d.revenue));

  return (
    <GlassCard>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>
        Store Insights
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: theme.spacing.md }}>
        <StatTile label="Total Revenue" value={formatPeso(insights.totalRevenue)} theme={theme} />
        <StatTile label="Total Orders" value={String(insights.totalOrders)} theme={theme} />
        <StatTile label="Avg. Order Value" value={formatPeso(insights.avgOrderValue)} theme={theme} />
        <StatTile label="Completion Rate" value={`${Math.round(insights.completionRate * 100)}%`} theme={theme} />
      </div>

      <div style={{ marginTop: theme.spacing.lg }}>
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
          Last 7 Days Revenue
        </span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: theme.spacing.sm, height: 120, marginTop: theme.spacing.sm }}>
          {insights.last7DaysRevenue.map((d) => (
            <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <div
                title={formatPeso(d.revenue)}
                style={{
                  width: "100%",
                  maxWidth: 32,
                  height: Math.max(4, (d.revenue / maxDailyRevenue) * 96),
                  backgroundColor: theme.colors.brandPrimary,
                  borderRadius: theme.radius.sm,
                }}
              />
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                {new Date(d.date).toLocaleDateString("en-PH", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: theme.spacing.lg }}>
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>Top Products</span>
        <div style={{ marginTop: theme.spacing.sm, display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
          {insights.topProducts.length === 0 ? (
            <EmptyState title="No sales data yet" />
          ) : (
            insights.topProducts.map((p) => (
              <div key={p.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.sm }}>
                <span style={{ color: theme.colors.textPrimary }}>{p.name}</span>
                <span style={{ color: theme.colors.textSecondary }}>
                  {p.unitsSold} sold · {formatPeso(p.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function StatTile({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>{value}</span>
    </div>
  );
}
