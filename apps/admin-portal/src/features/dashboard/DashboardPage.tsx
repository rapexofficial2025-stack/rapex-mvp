import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, ErrorState, Loading, useTheme } from "@rapex/ui-web";
import {
  useApproveApplicantAction,
  useCurrentAdmin,
  useDashboardOverview,
  useRejectApplicantAction,
  useVerificationQueue,
  type RecentOrderStatus,
  type SystemServiceStatus,
} from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import { RevenueLineChart } from "./RevenueLineChart";
import { RevenueDonut } from "./RevenueDonut";
import { KpiCard } from "./KpiCard";
import { MOCK_ACTIVITY } from "../operations-command-center/mockData";
import { ACTIVITY_LABEL } from "../operations-command-center/statusStyles";
import { PortalDashboardFrame, PortalPanel } from "../../shared/portal-ui/PortalDashboardPrimitives";

const ORDER_STATUS_TONE: Record<RecentOrderStatus, "neutral" | "info" | "warning" | "success" | "error"> = {
  pending: "neutral",
  accepted: "info",
  preparing: "warning",
  "out-for-delivery": "info",
  delivered: "success",
  cancelled: "error",
};

const SYSTEM_STATUS_COLOR: Record<SystemServiceStatus, string> = {
  operational: "#22C55E",
  degraded: "#F59E0B",
  down: "#EF4444",
};

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.startsWith("/admin/preview");
  const adminPath = (path: string) => (isPreview ? path.replace("/admin/", "/admin/preview/") : path);
  const { data: admin } = useCurrentAdmin();
  const { data: overview, loading, error, refetch } = useDashboardOverview();
  const { data: verificationQueue } = useVerificationQueue();
  const approve = useApproveApplicantAction();
  const reject = useRejectApplicantAction();

  if (loading) return <Loading />;
  if (error || !overview) return <ErrorState description={error ?? "Could not load dashboard."} onRetry={refetch} />;

  return (
    <PortalDashboardFrame
      eyebrow="RAPEX command center"
      title="Executive overview"
      description={`Welcome back${admin ? `, ${admin.name.split(" ")[0]}` : ""}. Monitor today's platform activity from one operational workspace.`}
      notice={<Badge label="Mock data — backend endpoint required" tone="warning" />}
      activeTab="overview"
      tabs={[
        { key: "overview", label: "Overview", onSelect: () => navigate(adminPath("/admin/dashboard")) },
        { key: "operations", label: "Operations", onSelect: () => navigate(adminPath("/admin/command-center")) },
        { key: "finance", label: "Finance", onSelect: () => navigate(adminPath("/admin/order-financials")) },
        { key: "verification", label: "Verification", onSelect: () => navigate(adminPath("/admin/verification")) },
      ]}
    >

      {/* Top KPI row */}
      <div className="rapex-dashboard-grid">
        <KpiCard label="Total Revenue (Today)" value={formatPeso(overview.revenueToday)} changePercent={overview.revenueTodayChangePercent} />
        <KpiCard label="Total Orders (Today)" value={String(overview.ordersToday)} changePercent={overview.ordersTodayChangePercent} />
        <KpiCard label="Completed Orders" value={String(overview.completedOrdersToday)} changePercent={overview.completedOrdersChangePercent} />
        <KpiCard label="Pending Orders" value={String(overview.pendingOrders)} changePercent={overview.pendingOrdersChangePercent} />
        <KpiCard label="Online Riders" value={String(overview.onlineRiders)} />
        <KpiCard label="Online Stores" value={String(overview.onlineStores)} />
      </div>

      {/* Revenue overview + breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: theme.spacing.md }}>
        <PortalPanel title="Revenue Overview" subtitle="Placeholder weekly performance">
          <RevenueLineChart points={overview.revenueTrend} />
        </PortalPanel>
        <PortalPanel title="Revenue Breakdown" subtitle="Placeholder platform mix">
          <RevenueDonut slices={overview.revenueBreakdown} />
        </PortalPanel>
      </div>

      {/* Secondary counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: theme.spacing.sm }}>
        {[
          ["Registered Customers", overview.registeredCustomers],
          ["Registered Merchants", overview.registeredMerchants],
          ["Registered Riders", overview.registeredRiders],
          ["Products Listed", overview.productsListed],
          ["Stores Listed", overview.storesListed],
          ["Categories", overview.categoriesCount],
          ["Municipalities", overview.municipalitiesCount],
          ["Active Auctions", overview.activeAuctions],
        ].map(([label, value]) => (
          <div
            className="rapex-soft-glass-card"
            key={label as string}
            style={{
              borderRadius: theme.radius.md,
              padding: theme.spacing.sm,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders / pending approvals / system status */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: theme.spacing.md, alignItems: "start" }}>
        <PortalPanel title="Recent Orders" action={<Button className="rapex-glass-button" label="View All" variant="secondary" size="sm" onClick={() => navigate(adminPath("/admin/order-financials"))} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
            {overview.recentOrders.map((order) => (
              <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${theme.spacing.xs}px 0` }}>
                <div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary, fontWeight: 600 }}>#{order.id}</div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{order.storeName}</div>
                </div>
                <Badge label={order.status.replace(/-/g, " ")} tone={ORDER_STATUS_TONE[order.status]} />
              </div>
            ))}
          </div>
        </PortalPanel>

        <PortalPanel title="Pending Approvals" action={<Button className="rapex-glass-button" label="View All" variant="secondary" size="sm" onClick={() => navigate(adminPath("/admin/verification"))} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {(verificationQueue ?? []).slice(0, 4).map((applicant) => (
              <div key={applicant.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary, fontWeight: 600 }}>{applicant.name}</div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>New {applicant.role.replace("-", " ")}</div>
                </div>
                <div style={{ display: "flex", gap: theme.spacing.xxs }}>
                  <Button className="rapex-primary-button" label="Approve" size="sm" onClick={() => approve.execute(applicant.id).then(() => refetch())} />
                  <Button label="Reject" size="sm" variant="danger" onClick={() => reject.execute(applicant.id).then(() => refetch())} />
                </div>
              </div>
            ))}
            {(verificationQueue ?? []).length === 0 ? (
              <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Nothing pending.</div>
            ) : null}
          </div>
        </PortalPanel>

        <PortalPanel title="System Status">
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
            {overview.systemStatus.map((item) => (
              <div key={item.service} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{item.service}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: SYSTEM_STATUS_COLOR[item.status] }} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </PortalPanel>
      </div>

      {/* Live map widget + activity feed + membership expirations */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: theme.spacing.md, alignItems: "start" }}>
        <PortalPanel title="Live Operations Map" action={<Button className="rapex-glass-button" label="View Full Map" variant="secondary" size="sm" onClick={() => navigate(adminPath("/admin/command-center"))} />}>
          <div
            onClick={() => navigate(adminPath("/admin/command-center"))}
            style={{
              cursor: "pointer",
              height: 160,
              borderRadius: theme.radius.md,
              background: `linear-gradient(135deg, ${theme.colors.brandPrimary}22, ${theme.colors.brandSecondary}22)`,
              border: `1px dashed ${theme.colors.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
              {overview.onlineRiders} riders · {overview.onlineStores} stores online
            </div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.brandPrimary }}>Open live map →</div>
          </div>
        </PortalPanel>

        <PortalPanel title="Live Activity Feed">
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs, maxHeight: 200, overflowY: "auto" }}>
            {MOCK_ACTIVITY.slice(0, 6).map((event) => (
              <div key={event.id}>
                <div style={{ fontSize: theme.typography.fontSize.xs, fontWeight: 700, color: theme.colors.brandPrimary }}>
                  {ACTIVITY_LABEL[event.type]}
                </div>
                <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{event.message}</div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{event.timestamp}</div>
              </div>
            ))}
          </div>
        </PortalPanel>

        <PortalPanel title="Upcoming Membership Expiration">
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {overview.membershipExpirations.map((item) => (
              <div key={item.merchantName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{item.merchantName}</span>
                <Badge label={`${item.daysLeft} days left`} tone={item.daysLeft <= 7 ? "warning" : "neutral"} />
              </div>
            ))}
            {overview.membershipExpirations.length === 0 ? (
              <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Nothing expiring soon.</div>
            ) : null}
          </div>
        </PortalPanel>
      </div>

      {/* Quick actions */}
      <PortalPanel title="Next steps">
        <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
          <Button className="rapex-primary-button" label="Review verification queue" onClick={() => navigate(adminPath("/admin/verification"))} />
          <Button className="rapex-glass-button" label="Open command center" variant="secondary" onClick={() => navigate(adminPath("/admin/command-center"))} />
          <Button className="rapex-glass-button" label="Engine Center" variant="secondary" onClick={() => navigate(adminPath("/admin/engine-center"))} />
          <Button className="rapex-glass-button" label="Order Financials" variant="secondary" onClick={() => navigate(adminPath("/admin/order-financials"))} />
        </div>
      </PortalPanel>
    </PortalDashboardFrame>
  );
}
