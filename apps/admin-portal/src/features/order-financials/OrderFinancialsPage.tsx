import { useState } from "react";
import { Badge, DataTable, ErrorState, Loading, Modal, useTheme, type DataTableColumn } from "@rapex/ui-web";
import { useAdminOrderFinancials, type AdminOrderRecord } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";

const COLUMNS: DataTableColumn<AdminOrderRecord>[] = [
  { key: "orderId", header: "Order", render: (o) => `#${o.orderId}`, sortValue: (o) => o.orderId },
  { key: "distance", header: "Distance", render: (o) => `${o.distanceKm.toFixed(1)} km`, sortValue: (o) => o.distanceKm },
  { key: "deliveryFee", header: "Delivery Fee", render: (o) => formatPeso(o.deliveryFee), sortValue: (o) => o.deliveryFee },
  { key: "merchantReceives", header: "Merchant Receives", render: (o) => formatPeso(o.merchantReceives), sortValue: (o) => o.merchantReceives },
  { key: "platformRevenue", header: "Platform Revenue", render: (o) => formatPeso(o.platformRevenue), sortValue: (o) => o.platformRevenue },
  { key: "riderEarnings", header: "Rider Earnings", render: (o) => formatPeso(o.riderEarnings), sortValue: (o) => o.riderEarnings },
  { key: "walletDeduction", header: "Wallet Deduction", render: (o) => formatPeso(o.walletDeduction), sortValue: (o) => o.walletDeduction },
  { key: "status", header: "Status", render: (o) => <Badge label={o.status.replace(/-/g, " ")} tone="success" /> },
];

export function OrderFinancialsPage() {
  const theme = useTheme();
  const { data: orders, loading, error, refetch } = useAdminOrderFinancials();
  const [selected, setSelected] = useState<AdminOrderRecord | null>(null);

  if (loading) return <Loading />;
  if (error || !orders) return <ErrorState description={error ?? "Could not load order financials."} onRetry={refetch} />;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Order Financials</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Delivery Fee Engine settlements -- Distance, Delivery Fee, Merchant Receives, Platform Revenue, Rider Earnings,
            Wallet Deduction, per order. Click a row for the full order timeline.
          </p>
        </div>
        <Badge label="Mock data — backend endpoint required" tone="warning" />
      </div>

      <DataTable
        columns={COLUMNS}
        rows={orders}
        rowKey={(o) => o.orderId}
        searchPlaceholder="Search order id…"
        searchFn={(o, q) => o.orderId.toLowerCase().includes(q) || o.merchantName.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)}
        onRowClick={setSelected}
        emptyMessage="No settled orders yet"
      />

      {selected ? (
        <Modal title={`Order #${selected.orderId} Timeline`} onClose={() => setSelected(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
            <SummaryLine label="Customer" value={selected.customerName} />
            <SummaryLine label="Merchant" value={selected.merchantName} />
            <SummaryLine label="Rider" value={selected.riderName} />
            <SummaryLine label="Product Total" value={formatPeso(selected.productTotal)} />
            <SummaryLine label="Final Total" value={formatPeso(selected.finalTotal)} />
          </div>
          <div style={{ borderTop: `1px solid ${theme.colors.border}`, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm }}>
            {selected.timeline.map((entry, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: `${theme.spacing.xxs}px 0` }}>
                <span style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.sm }}>
                  {entry.status.replace(/-/g, " ")}
                </span>
                <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.xs }}>
                  {new Date(entry.occurredAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</span>
      <span style={{ color: theme.colors.textPrimary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{value}</span>
    </div>
  );
}
