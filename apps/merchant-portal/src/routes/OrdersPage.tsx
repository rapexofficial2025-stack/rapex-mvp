import { useEffect, useState } from "react";
import { DataTable, ErrorState, Loading, useTheme, type DataTableColumn } from "@rapex/ui-web";
import { useMerchantOrderFinancials, useMyStores, type MerchantOrderFinancials } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";

const COLUMNS: DataTableColumn<MerchantOrderFinancials>[] = [
  { key: "orderId", header: "Order", render: (o) => `#${o.orderId}`, sortValue: (o) => o.orderId },
  { key: "distanceKm", header: "Distance", render: (o) => `${o.distanceKm.toFixed(1)} km`, sortValue: (o) => o.distanceKm },
  { key: "deliveryFee", header: "Delivery Fee", render: (o) => formatPeso(o.deliveryFee), sortValue: (o) => o.deliveryFee },
  { key: "customerPayment", header: "Customer Payment", render: (o) => formatPeso(o.customerPayment), sortValue: (o) => o.customerPayment },
  { key: "merchantReceives", header: "Merchant Receives", render: (o) => formatPeso(o.merchantReceives), sortValue: (o) => o.merchantReceives },
];

export function OrdersPage() {
  const theme = useTheme();
  const { data: stores, loading: storesLoading } = useMyStores();
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId && stores && stores.length > 0) setStoreId(stores[0]!.id);
  }, [stores, storeId]);

  const { data: orderFinancials, loading, error, refetch } = useMerchantOrderFinancials(storeId);

  if (storesLoading) return <Loading />;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <div>
        <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Orders</h2>
        <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
          Delivery Fee Engine settlements for this store -- Distance, Delivery Fee, Customer Payment, Merchant Receives.
        </p>
      </div>

      {stores && stores.length > 1 ? (
        <select
          value={storeId ?? ""}
          onChange={(e) => setStoreId(e.target.value)}
          style={{
            alignSelf: "flex-start",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      ) : null}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={orderFinancials ?? []}
          rowKey={(o) => o.orderId}
          emptyMessage="No settled orders for this store yet"
        />
      )}
    </div>
  );
}
