import { Badge, Button, useTheme } from "@rapex/ui-web";
import { useNavigate } from "react-router-dom";

// Placeholder-only dashboard content. Claude will replace these values with
// the Merchant/Xano dashboard response when that endpoint is finalized.
const PLACEHOLDER_SUMMARY = [
  { label: "Orders today", value: "12" },
  { label: "Awaiting preparation", value: "3" },
  { label: "Store status", value: "Open" },
];

const PLACEHOLDER_ORDERS = [
  { id: "RPX-1042", customer: "Maria S.", status: "Preparing" },
  { id: "RPX-1041", customer: "Joel R.", status: "Ready for pickup" },
  { id: "RPX-1040", customer: "Ana C.", status: "Completed" },
];

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Store overview</h2>
          <p style={{ margin: `${theme.spacing.xs}px 0 0`, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            A simple view of today&apos;s store activity.
          </p>
        </div>
        <Badge label="Placeholder data — Xano dashboard endpoint pending" tone="warning" />
      </div>

      <section aria-label="Store summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: theme.spacing.md }}>
        {PLACEHOLDER_SUMMARY.map((item) => (
          <div key={item.label} style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, padding: theme.spacing.lg }}>
            <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{item.label}</div>
            <div style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.xl, fontWeight: 700, marginTop: theme.spacing.xs }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, padding: theme.spacing.lg }}>
        <h3 style={{ margin: 0, color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.base }}>Recent orders</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          {PLACEHOLDER_ORDERS.map((order) => (
            <div key={order.id} style={{ display: "flex", justifyContent: "space-between", gap: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: theme.spacing.sm }}>
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{order.id}</span>
              <span style={{ color: theme.colors.textSecondary }}>{order.customer}</span>
              <span style={{ color: theme.colors.textPrimary }}>{order.status}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
        <Button label="View orders" onClick={() => navigate("/portal/orders")} />
        <Button label="Manage store" variant="secondary" onClick={() => navigate("/portal/store")} />
      </div>
    </div>
  );
}
