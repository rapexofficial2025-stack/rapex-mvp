import { useMemo, useState, type CSSProperties } from "react";
import { Badge, useTheme } from "@rapex/ui-web";

type ProductStatus = "Active" | "Review" | "Unavailable";
type Product = { id: string; name: string; store: string; category: string; price: string; stock: number; status: ProductStatus; updated: string };

// PLACEHOLDER DATA ONLY. Replace with /admin-master-data/products once the
// real response schema and pagination/filter contract are supplied by Xano.
const PRODUCTS: Product[] = [
  { id: "PRD-EXAMPLE-001", name: "Premium rice 5 kg", store: "Example Grocery", category: "Groceries", price: "₱312.00", stock: 48, status: "Active", updated: "Just now" },
  { id: "PRD-EXAMPLE-002", name: "Chicken meal set", store: "Example Kitchen", category: "Food & beverage", price: "₱189.00", stock: 12, status: "Active", updated: "8 min ago" },
  { id: "PRD-EXAMPLE-003", name: "USB-C charging cable", store: "Example Electronics", category: "Electronics", price: "₱249.00", stock: 0, status: "Unavailable", updated: "25 min ago" },
  { id: "PRD-EXAMPLE-004", name: "Hand drill kit", store: "Example Hardware", category: "Hardware", price: "₱1,450.00", stock: 7, status: "Review", updated: "1 hr ago" },
];

export function ProductMonitoringPage() {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const filtered = useMemo(() => PRODUCTS.filter((product) => (status === "All" || product.status === status) && `${product.name} ${product.store} ${product.id}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  return <section style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
    <header style={styles.header}><div><p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>MARKETPLACE CONTROL</p><h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>Product Monitoring</h1><p style={{ ...styles.copy, color: theme.colors.textSecondary }}>Review product availability, catalog status, and store inventory at a glance.</p></div><Badge label="Placeholder data — Xano endpoint required" tone="warning" /></header>
    <div style={{ ...styles.summaryGrid }}>
      {[['Catalog products', '—'], ['Stores represented', '—'], ['Needs review', '—'], ['Out of stock', '—']].map(([label, value]) => <div key={label} style={{ ...styles.summary, background: theme.colors.surface, borderColor: theme.colors.border }}><span style={{ color: theme.colors.textSecondary }}>{label}</span><strong style={{ color: theme.colors.textPrimary }}>{value}</strong></div>)}
    </div>
    <div style={{ ...styles.filters, background: theme.colors.surface, borderColor: theme.colors.border }}><input style={{ ...styles.search, background: theme.colors.surfaceAlt, borderColor: theme.colors.border, color: theme.colors.textPrimary }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, store, or product ID" /><select style={{ ...styles.select, background: theme.colors.surfaceAlt, borderColor: theme.colors.border, color: theme.colors.textPrimary }} value={status} onChange={(event) => setStatus(event.target.value as "All" | ProductStatus)}><option>All</option><option>Active</option><option>Review</option><option>Unavailable</option></select></div>
    <div style={{ ...styles.table, background: theme.colors.surface, borderColor: theme.colors.border }}><div style={styles.tableHeader}><span>Product</span><span>Store</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span>Updated</span></div>{filtered.map((product) => <div key={product.id} style={{ ...styles.row, borderColor: theme.colors.border }}><div><strong style={{ color: theme.colors.textPrimary }}>{product.name}</strong><small style={{ color: theme.colors.textSecondary }}>{product.id}</small></div><span style={{ color: theme.colors.textPrimary }}>{product.store}</span><span style={{ color: theme.colors.textSecondary }}>{product.category}</span><span style={{ color: theme.colors.textPrimary }}>{product.price}</span><span style={{ color: product.stock === 0 ? "#e8b449" : theme.colors.textPrimary }}>{product.stock}</span><span style={{ ...styles.status, color: product.status === "Active" ? "#45d890" : product.status === "Review" ? "#e8b449" : "#e97079" }}>{product.status}</span><span style={{ color: theme.colors.textSecondary }}>{product.updated}</span></div>)}{filtered.length === 0 ? <p style={{ padding: 16, color: theme.colors.textSecondary }}>No matching placeholder products.</p> : null}</div>
  </section>;
}

const styles: Record<string, CSSProperties> = { header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }, eyebrow: { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: .9 }, title: { margin: "4px 0", fontSize: 28 }, copy: { margin: 0, fontSize: 14 }, summaryGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(140px, 1fr))", gap: 12 }, summary: { border: "1px solid", borderTop: "2px solid #6477ff", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }, filters: { border: "1px solid", borderRadius: 12, padding: 12, display: "flex", gap: 10 }, search: { flex: 1, minWidth: 240, border: "1px solid", borderRadius: 8, padding: "10px 11px", font: "inherit", outline: "none" }, select: { border: "1px solid", borderRadius: 8, padding: "10px 11px", font: "inherit" }, table: { border: "1px solid", borderRadius: 12, overflow: "hidden" }, tableHeader: { display: "grid", gridTemplateColumns: "1.8fr 1.3fr 1.2fr .8fr .6fr .9fr .8fr", gap: 12, padding: "12px 16px", color: "#8d88a8", fontSize: 10, fontWeight: 800, letterSpacing: .5, textTransform: "uppercase" }, row: { display: "grid", gridTemplateColumns: "1.8fr 1.3fr 1.2fr .8fr .6fr .9fr .8fr", gap: 12, alignItems: "center", padding: "14px 16px", borderTop: "1px solid", fontSize: 13 }, status: { fontSize: 12, fontWeight: 800 },
};
