import { Badge, Button, useTheme } from "@rapex/ui-web";
import { useNavigate } from "react-router-dom";
import { PortalDashboardFrame, PortalMetric, PortalPanel } from "../../../admin-portal/src/shared/portal-ui/PortalDashboardPrimitives";

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
    <PortalDashboardFrame
      eyebrow="RAPEX Merchant OS"
      title="Store overview"
      description="Monitor orders and store readiness from the same premium operational system used by RAPEX Admin."
      notice={<Badge label="Placeholder data — Xano dashboard endpoint pending" tone="warning" />}
      activeTab="overview"
      tabs={[
        { key: "overview", label: "Overview", onSelect: () => navigate("/portal/dashboard") },
        { key: "orders", label: "Orders", onSelect: () => navigate("/portal/orders") },
        { key: "store", label: "Store", onSelect: () => navigate("/portal/store") },
      ]}
    >

      <section aria-label="Store summary" className="rapex-dashboard-grid">
        {PLACEHOLDER_SUMMARY.map((item, index) => (
          <PortalMetric
            key={item.label}
            label={item.label}
            value={item.value}
            tone={index === 1 ? "yellow" : index === 2 ? "mint" : "lavender"}
            detail="Placeholder snapshot"
          />
        ))}
      </section>

      <div className="rapex-dashboard-grid">
        <PortalPanel
          className="is-wide"
          title="Recent orders"
          subtitle="Placeholder queue — live Merchant endpoint not connected"
          action={<Button label="View orders" size="sm" onClick={() => navigate("/portal/orders")} />}
        >
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          {PLACEHOLDER_ORDERS.map((order) => (
            <div key={order.id} style={{ display: "flex", justifyContent: "space-between", gap: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: theme.spacing.sm }}>
              <span style={{ color: "var(--portal-text)", fontWeight: 650 }}>{order.id}</span>
              <span style={{ color: "var(--portal-muted)" }}>{order.customer}</span>
              <span style={{ color: "var(--portal-text)" }}>{order.status}</span>
            </div>
          ))}
        </div>
        </PortalPanel>

        <PortalPanel title="Store controls" subtitle="Business setup and catalog management">
          <p style={{ margin: `0 0 ${theme.spacing.md}px`, color: "var(--portal-muted)", fontSize: theme.typography.fontSize.sm, lineHeight: 1.55 }}>
            Review your store profile, products, coverage, and operating status.
          </p>
          <Button label="Manage store" variant="secondary" onClick={() => navigate("/portal/store")} />
        </PortalPanel>
      </div>
    </PortalDashboardFrame>
  );
}
