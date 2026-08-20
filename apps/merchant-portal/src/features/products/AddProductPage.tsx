import { useState, type CSSProperties } from "react";
import { Badge, Button, EmptyState, ErrorState, Input, Loading, useTheme } from "@rapex/ui-web";
import { useAsync, useAsyncAction, useRepositories } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import { useMerchantStoreWorkspace } from "../workspace/useMerchantStoreWorkspace";

/**
 * Deliberately simple, one-task screen -- most RAPEX merchants are
 * phone-only local vendors who are not techy, per founder instruction
 * (2026-08-20): "GCash style" clarity, one core action per screen.
 *
 * Uses merchant.createProduct(), the real Xano-backed E2E Alpha write
 * path (see XanoMerchantRepository's doc comment -- confirmed live
 * against the admin-master-data group, 2026-08-03 handover), not a mock.
 * This is the first screen in this portal that actually calls it outside
 * the one-time onboarding wizard.
 */
export function AddProductPage() {
  const theme = useTheme();
  const { merchant } = useRepositories();
  const { currentStore, currentStoreId } = useMerchantStoreWorkspace();

  const { data: products, loading: productsLoading, error: productsError, refetch } = useAsync(
    () => (currentStoreId ? merchant!.getStoreProducts(currentStoreId) : Promise.resolve([])),
    [currentStoreId],
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const createProduct = useAsyncAction((input: { name: string; price: number; productCategory: string }) =>
    merchant!.createProduct(currentStoreId!, input),
  );

  if (!currentStoreId) {
    return (
      <div style={styles.page}>
        <EmptyState title="No store yet" description="Register your store before adding products." />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>Add Product</h1>
      <p style={{ color: theme.colors.textSecondary, margin: 0 }}>For {currentStore?.name ?? "your store"}</p>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <Input label="Product Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Chicken Adobo" />
        <Input label="Price (₱)" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 99" />
        <Input label="Category" value={productCategory} onChange={(event) => setProductCategory(event.target.value)} placeholder="e.g. Ulam" />

        {createProduct.error ? <ErrorState description={createProduct.error} /> : null}

        <Button
          label={createProduct.loading ? "Adding…" : "Add Product"}
          loading={createProduct.loading}
          disabled={!name || !price}
          onClick={async () => {
            const created = await createProduct.execute({ name, price: Number(price), productCategory });
            setJustAdded(created.name);
            setName("");
            setPrice("");
            setProductCategory("");
            refetch();
          }}
        />
        {justAdded ? <Badge label={`${justAdded} added ✓`} tone="success" /> : null}
      </div>

      <h2 style={{ ...styles.sectionTitle, color: theme.colors.textPrimary }}>Your Products</h2>
      {productsLoading ? (
        <Loading />
      ) : productsError ? (
        <ErrorState description={productsError} onRetry={refetch} />
      ) : !products || products.length === 0 ? (
        <EmptyState title="No products yet" description="Products you add will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((product) => (
            <div key={product.id} style={{ ...styles.productRow, borderColor: theme.colors.border, background: theme.colors.surface }}>
              <div>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>{product.name}</span>
                <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{product.productCategory || "Uncategorized"}</div>
              </div>
              <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>{formatPeso(product.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 480, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  card: { border: "1px solid", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, margin: "8px 0 0" },
  productRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: "1px solid" },
};
