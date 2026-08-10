import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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

function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const theme = useTheme();
  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: 700, color: theme.colors.textPrimary }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: admin } = useCurrentAdmin();
  const { data: overview, loading, error, refetch } = useDashboardOverview();
  const { data: verificationQueue } = useVerificationQueue();
  const approve = useApproveApplicantAction();
  const reject = useRejectApplicantAction();

  if (loading) return <Loading />;
  if (error || !overview) return <ErrorState description={error ?? "Could not load dashboard."} onRetry={refetch} />;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Dashboard</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Welcome back{admin ? `, ${admin.name.split(" ")[0]}` : ""}! Here's what's happening today.
          </p>
        </div>
        <Badge label="Mock data — backend endpoint required" tone="warning" />
      </div>

      {/* Top KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: theme.spacing.md }}>
        <KpiCard icon="💰" label="Total Revenue (Today)" value={formatPeso(overview.revenueToday)} changePercent={overview.revenueTodayChangePercent} accentColor="#8B5CF633" />
        <KpiCard icon="🛍️" label="Total Orders (Today)" value={String(overview.ordersToday)} changePercent={overview.ordersTodayChangePercent} accentColor="#3B82F633" />
        <KpiCard icon="✅" label="Completed Orders" value={String(overview.completedOrdersToday)} changePercent={overview.completedOrdersChangePercent} accentColor="#22C55E33" />
        <KpiCard icon="⏱️" label="Pending Orders" value={String(overview.pendingOrders)} changePercent={overview.pendingOrdersChangePercent} accentColor="#F59E0B33" />
        <KpiCard icon="🛵" label="Online Riders" value={String(overview.onlineRiders)} accentColor="#14B8A633" />
        <KpiCard icon="🏬" label="Online Stores" value={String(overview.onlineStores)} accentColor="#F9731633" />
      </div>

      {/* Revenue overview + breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: theme.spacing.md }}>
        <SectionCard title="Revenue Overview (This Week)">
          <RevenueLineChart points={overview.revenueTrend} />
        </SectionCard>
        <SectionCard title="Revenue Breakdown">
          <RevenueDonut slices={overview.revenueBreakdown} />
        </SectionCard>
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
            key={label as string}
            style={{
              backgroundColor: theme.colors.surfaceAlt,
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
        <SectionCard title="Recent Orders" action={<Button label="View All" variant="secondary" size="sm" onClick={() => navigate("/admin/order-financials")} />}>
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
        </SectionCard>

        <SectionCard title="Pending Approvals" action={<Button label="View All" variant="secondary" size="sm" onClick={() => navigate("/admin/verification")} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {(verificationQueue ?? []).slice(0, 4).map((applicant) => (
              <div key={applicant.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary, fontWeight: 600 }}>{applicant.name}</div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>New {applicant.role.replace("-", " ")}</div>
                </div>
                <div style={{ display: "flex", gap: theme.spacing.xxs }}>
                  <button
                    type="button"
                    onClick={() => approve.execute(applicant.id).then(() => refetch())}
                    style={{ border: "none", borderRadius: theme.radius.sm, backgroundColor: theme.colors.success, color: "#fff", width: 26, height: 26, cursor: "pointer" }}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => reject.execute(applicant.id).then(() => refetch())}
                    style={{ border: "none", borderRadius: theme.radius.sm, backgroundColor: theme.colors.error, color: "#fff", width: 26, height: 26, cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {(verificationQueue ?? []).length === 0 ? (
              <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>Nothing pending.</div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="System Status">
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
        </SectionCard>
      </div>

      {/* Live map widget + activity feed + membership expirations */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: theme.spacing.md, alignItems: "start" }}>
        <SectionCard title="Live Operations Map" action={<Button label="View Full Map" variant="secondary" size="sm" onClick={() => navigate("/admin/command-center")} />}>
          <div
            onClick={() => navigate("/admin/command-center")}
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
            <div style={{ fontSize: theme.typography.fontSize.lg }}>🗺️</div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
              {overview.onlineRiders} riders · {overview.onlineStores} stores online
            </div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.brandPrimary }}>Open live map →</div>
          </div>
        </SectionCard>

        <SectionCard title="Live Activity Feed">
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
        </SectionCard>

        <SectionCard title="Upcoming Membership Expiration">
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
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard title="Quick Actions">
        <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
          <Button label="Approve Merchant" onClick={() => navigate("/admin/verification")} />
          <Button label="Approve Rider" variant="secondary" onClick={() => navigate("/admin/verification")} />
          <Button label="View Live Map" variant="secondary" onClick={() => navigate("/admin/command-center")} />
          <Button label="Engine Center" variant="secondary" onClick={() => navigate("/admin/engine-center")} />
          <Button label="Order Financials" variant="secondary" onClick={() => navigate("/admin/order-financials")} />
        </div>
      </SectionCard>
    </div>
  );
}
