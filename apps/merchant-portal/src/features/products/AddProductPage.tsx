import { useState, type CSSProperties } from "react";
import Papa from "papaparse";
import { Badge, Button, EmptyState, ErrorState, Input, Loading, useTheme } from "@rapex/ui-web";
import { useAsync, useAsyncAction, useRepositories, type ProductImportRow } from "@rapex/api-client";
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);

  const createProduct = useAsyncAction((input: { name: string; price: number; productCategory: string }) =>
    merchant!.createProduct(currentStoreId!, input),
  );

  const importCsv = useAsyncAction((rows: ProductImportRow[]) => merchant!.bulkImportProducts(currentStoreId!, rows));

  function handlePhotoSelected(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function handleCsvSelected(file: File | undefined) {
    if (!file) return;
    setCsvNotice(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const { data } = Papa.parse<Record<string, string>>(String(reader.result ?? ""), { header: true, skipEmptyLines: true });
      const rows: ProductImportRow[] = data
        .map((raw) => ({
          name: (raw.name ?? raw.Name ?? "").trim(),
          price: Number(raw.price ?? raw.Price),
          productCategory: (raw.category ?? raw.productCategory ?? raw.Category ?? "").trim(),
          stock: Number(raw.stock ?? raw.Stock ?? 0),
        }))
        .filter((row) => row.name && Number.isFinite(row.price));
      if (rows.length === 0) {
        setCsvNotice("No valid rows found. Columns needed: name, price, category (stock optional).");
        return;
      }
      const result = await importCsv.execute(rows);
      setCsvNotice(`Imported ${result.imported.length} product(s)${result.failedCount > 0 ? `, ${result.failedCount} failed` : ""}.`);
      refetch();
    };
    reader.readAsText(file);
  }

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
        <label style={styles.photoPicker}>
          {photoPreview ? (
            <img src={photoPreview} alt="Product preview" style={styles.photoPreviewImg} />
          ) : (
            <span style={{ color: theme.colors.textSecondary, fontSize: 13 }}>📷 Add Photo</span>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(event) => handlePhotoSelected(event.target.files?.[0])}
          />
        </label>
        {photoPreview ? <Badge label="Photo not saved yet -- needs a confirmed Xano image-upload endpoint" tone="neutral" /> : null}

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
            setPhotoPreview(null);
            refetch();
          }}
        />
        {justAdded ? <Badge label={`${justAdded} added ✓`} tone="success" /> : null}
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <h2 style={{ ...styles.sectionTitle, color: theme.colors.textPrimary, margin: 0 }}>Have a lot of products?</h2>
        <p style={{ color: theme.colors.textSecondary, fontSize: 13, margin: 0 }}>
          Upload a CSV file (columns: name, price, category, stock). Have a Google Sheet? In Google Sheets, use
          File → Download → Comma Separated Values (.csv), then upload that file here.
        </p>
        <label style={styles.csvButton}>
          {importCsv.loading ? "Importing…" : "Upload CSV file"}
          <input type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(event) => handleCsvSelected(event.target.files?.[0])} />
        </label>
        {importCsv.error ? <ErrorState description={importCsv.error} /> : null}
        {csvNotice ? <Badge label={csvNotice} tone="info" /> : null}
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
  photoPicker: {
    height: 140,
    borderRadius: 12,
    border: "2px dashed rgba(139, 92, 246, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
  },
  photoPreviewImg: { width: "100%", height: "100%", objectFit: "cover" },
  csvButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.5)",
    color: "#8B5CF6",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
};
