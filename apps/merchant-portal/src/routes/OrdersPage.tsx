import { useState } from "react";
import { Badge, Button, DataTable, Modal, useTheme, type DataTableColumn } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";

type PlaceholderOrder = {
  id: string;
  customer: string;
  itemSummary: string;
  total: number;
  status: "New" | "Preparing" | "Ready for pickup";
};

// Placeholder-only order list. Claude will replace this with the confirmed
// Xano order list and status-transition actions when those contracts are ready.
const PLACEHOLDER_ORDERS: PlaceholderOrder[] = [
  { id: "RPX-1042", customer: "Maria S.", itemSummary: "2 items", total: 345, status: "New" },
  { id: "RPX-1041", customer: "Joel R.", itemSummary: "3 items", total: 580, status: "Preparing" },
  { id: "RPX-1040", customer: "Ana C.", itemSummary: "1 item", total: 190, status: "Ready for pickup" },
];

const COLUMNS: DataTableColumn<PlaceholderOrder>[] = [
  { key: "id", header: "Order", render: (order) => order.id, sortValue: (order) => order.id },
  { key: "customer", header: "Customer", render: (order) => order.customer, sortValue: (order) => order.customer },
  { key: "items", header: "Items", render: (order) => order.itemSummary },
  { key: "total", header: "Total", render: (order) => formatPeso(order.total), sortValue: (order) => order.total },
  { key: "status", header: "Status", render: (order) => <Badge label={order.status} tone={order.status === "New" ? "warning" : "info"} /> },
];

export function OrdersPage() {
  const theme = useTheme();
  const [selectedOrder, setSelectedOrder] = useState<PlaceholderOrder | null>(null);
  const [statusEditorOpen, setStatusEditorOpen] = useState(false);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.md }}>
        <div>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Orders</h2>
          <p style={{ margin: `${theme.spacing.xs}px 0 0`, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Select an order to review its details and next preparation step.
          </p>
        </div>
        <Badge label="Placeholder data — Xano order endpoint pending" tone="warning" />
      </div>

      <DataTable
        columns={COLUMNS}
        rows={PLACEHOLDER_ORDERS}
        rowKey={(order) => order.id}
        searchPlaceholder="Search orders…"
        searchFn={(order, query) => `${order.id} ${order.customer}`.toLowerCase().includes(query.toLowerCase())}
        onRowClick={setSelectedOrder}
        emptyMessage="No orders to show"
      />

      {selectedOrder ? (
        <Modal title={`Order ${selectedOrder.id}`} onClose={() => setSelectedOrder(null)} footer={<Button label="Update order status" onClick={() => setStatusEditorOpen(true)} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            <Detail label="Customer" value={selectedOrder.customer} />
            <Detail label="Items" value={selectedOrder.itemSummary} />
            <Detail label="Order total" value={formatPeso(selectedOrder.total)} />
            <Detail label="Current status" value={selectedOrder.status} />
            <Badge label="Placeholder detail — live order data not connected" tone="warning" />
          </div>
        </Modal>
      ) : null}

      {statusEditorOpen && selectedOrder ? (
        <Modal title="Update order status" onClose={() => setStatusEditorOpen(false)} footer={<Button label="Close" variant="secondary" onClick={() => setStatusEditorOpen(false)} />}>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Status updates will be connected to the confirmed Xano order transition endpoint. No order has been changed from this skeleton.
          </p>
          <div style={{ marginTop: theme.spacing.md }}>
            <Badge label={`Current placeholder status: ${selectedOrder.status}`} tone="info" />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: theme.spacing.md }}>
      <span style={{ color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
