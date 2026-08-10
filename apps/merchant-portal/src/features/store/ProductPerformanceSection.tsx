import { EmptyState, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantProduct } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";

type ProductPerformanceSectionProps = {
  products: MerchantProduct[];
};

export function ProductPerformanceSection({ products }: ProductPerformanceSectionProps) {
  const theme = useTheme();

  if (products.length === 0) {
    return (
      <HqSectionCard emoji="📈" title="Product Performance" color="teal">
        <EmptyState title="No products yet" description="Product performance will show up here once you add products." />
      </HqSectionCard>
    );
  }

  const fastMoving = [...products].sort((a, b) => a.stock - b.stock).slice(0, 3);
  const topSelling = [...products].sort((a, b) => b.price - a.price).slice(0, 3);
  const mostViewed = [...products].slice(0, 3);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const recentlyAdded = [...products].slice(-3).reverse();

  return (
    <HqSectionCard emoji="📈" title="Product Performance" color="teal">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: theme.spacing.md }}>
        <PerformanceCard title="🔥 Fast Moving" products={fastMoving} />
        <PerformanceCard title="🏆 Top Selling" products={topSelling} />
        <PerformanceCard title="👀 Most Viewed" products={mostViewed} />
        <PerformanceCard title="⚠️ Low Stock" products={lowStock.length ? lowStock : [{ id: "none", name: "All stocked up", price: 0, imageLabel: "✅", productCategory: "", stock: 0, isActive: true, variantCount: 0 } as MerchantProduct]} />
        <PerformanceCard title="🆕 Recently Added" products={recentlyAdded} />
      </div>
    </HqSectionCard>
  );
}

function PerformanceCard({ title, products }: { title: string; products: MerchantProduct[] }) {
  const theme = useTheme();
  return (
    <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, border: `1px solid ${theme.colors.border}` }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>{title}</span>
      <div style={{ marginTop: theme.spacing.sm, display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
        {products.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.xs }}>
            <span style={{ color: theme.colors.textPrimary }}>{p.imageLabel} {p.name}</span>
            {p.price > 0 ? <span style={{ color: theme.colors.textSecondary }}>{formatPeso(p.price)}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
