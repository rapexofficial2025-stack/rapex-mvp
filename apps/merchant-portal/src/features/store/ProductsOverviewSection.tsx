import { Badge, DataTable, type DataTableColumn, EmptyState, Loading, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantProduct, MerchantStore } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";

type ProductsOverviewSectionProps = {
  stores: MerchantStore[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  products: MerchantProduct[];
  loading: boolean;
};

export function ProductsOverviewSection({ stores, selectedStoreId, onSelectStore, products, loading }: ProductsOverviewSectionProps) {
  const theme = useTheme();
  const totalProducts = stores.reduce((sum, s) => sum + s.productCount, 0);

  const fastMoving = products.filter((p) => p.isActive && p.stock < 15).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const draft = products.filter((p) => !p.isActive).length;
  const inventory = products.reduce((sum, p) => sum + p.stock, 0);
  const returns = 2;

  const columns: DataTableColumn<MerchantProduct>[] = [
    { key: "image", header: "", render: (p) => <span style={{ fontSize: 18 }}>{p.imageLabel}</span> },
    { key: "name", header: "Product", render: (p) => p.name, sortValue: (p) => p.name },
    { key: "category", header: "Category", render: (p) => p.productCategory },
    { key: "price", header: "Price", render: (p) => formatPeso(p.price), sortValue: (p) => p.price },
    { key: "stock", header: "Stock", render: (p) => p.stock, sortValue: (p) => p.stock },
    { key: "status", header: "Status", render: (p) => <Badge label={p.isActive ? "Active" : "Draft"} tone={p.isActive ? "success" : "neutral"} /> },
  ];

  return (
    <HqSectionCard
      emoji="📦"
      title="Products Overview"
      color="blue"
      right={<span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Total {totalProducts} Products</span>}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
        <div>
          <label style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Store</label>
          <select
            value={selectedStoreId ?? ""}
            onChange={(e) => onSelectStore(e.target.value)}
            style={{ display: "block", marginTop: 4, padding: theme.spacing.sm, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}` }}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <StatChip label="Fast Moving" value={fastMoving} tone="success" />
        <StatChip label="Inventory" value={inventory} tone="info" />
        <StatChip label="Low Stock" value={lowStock} tone="warning" />
        <StatChip label="Out of Stock" value={outOfStock} tone="error" />
        <StatChip label="Returns" value={returns} tone="neutral" />
        <StatChip label="Draft" value={draft} tone="neutral" />
      </div>

      {loading ? (
        <Loading label="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState title="No products in this store yet" />
      ) : (
        <DataTable
          columns={columns}
          rows={products}
          rowKey={(p) => p.id}
          searchPlaceholder="Search products…"
          searchFn={(p, q) => p.name.toLowerCase().includes(q) || p.productCategory.toLowerCase().includes(q)}
          pageSize={5}
          emptyMessage="No products"
        />
      )}
    </HqSectionCard>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: "success" | "info" | "warning" | "error" | "neutral" }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
      <Badge label={String(value)} tone={tone} />
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{label}</span>
    </div>
  );
}
