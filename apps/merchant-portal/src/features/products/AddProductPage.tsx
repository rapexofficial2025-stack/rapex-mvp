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
 * Batch-add flow per founder instruction (2026-08-20): pick one Category
 * first, then add products into it one after another without the screen
 * exiting or resetting -- each field except Price and Quantity gets a
 * "Keep for next product" lock so the merchant isn't retyping the same
 * Category/Name/Photo for every item in a batch. Category defaults to
 * locked (it's the thing chosen first and meant to persist); Name and
 * Photo default to unlocked since those are normally different per item.
 *
 * "Add Product Engine" row (2026-09-03): a product can't be confirmed
 * without at least one variant -- RAPEX doesn't sell a bare product, every
 * listing needs at least a default size/quantity variant. The variant
 * table (name/price add-on/stock/SKU/image) is entered in a popup off the
 * row's "Add Variant" action; the first variant's photo becomes the
 * product's display photo if the product row itself has none.
 *
 * Uses merchant.createProduct()/createVariant(), the real Xano-backed E2E
 * Alpha write paths (see XanoMerchantRepository), not a mock. UOM,
 * Description and a per-product SKU aren't in the current Product schema
 * (see packages/api-client/src/repositories/types.ts) -- they're kept as
 * local-only row fields (like the photo) until a real column/endpoint
 * exists, same honesty pattern as the "Photo not saved yet" badge below.
 */
export function AddProductPage() {
  const theme = useTheme();
  const { merchant } = useRepositories();
  const { currentStore, currentStoreId } = useMerchantStoreWorkspace();

  const { data: products, loading: productsLoading, error: productsError, refetch } = useAsync(
    () => (currentStoreId ? merchant!.getStoreProducts(currentStoreId) : Promise.resolve([])),
    [currentStoreId],
  );

  const [row, setRow] = useState<DraftRow>(() => makeBlankRow());
  const [lockCategory, setLockCategory] = useState(true);
  const [lockName, setLockName] = useState(false);
  const [lockPhoto, setLockPhoto] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const createProduct = useAsyncAction((input: { name: string; price: number; productCategory: string; stock: number }) =>
    merchant!.createProduct(currentStoreId!, input),
  );
  const createVariant = useAsyncAction(({ productId, input }: { productId: string; input: DraftVariant }) =>
    merchant!.createVariant(productId, { name: input.name, priceDelta: input.priceDelta, stock: input.stock, sku: input.sku }),
  );
  const importCsv = useAsyncAction((rows: ProductImportRow[]) => merchant!.bulkImportProducts(currentStoreId!, rows));

  function handlePhotoSelected(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRow((prev) => ({ ...prev, photoPreview: String(reader.result ?? "") }));
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
        .filter((r) => r.name && Number.isFinite(r.price));
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

  const canConfirm = Boolean(row.name && row.productCategory && row.price && row.variants.length > 0);

  async function handleConfirm() {
    setRowError(null);
    if (row.variants.length === 0) {
      setRowError("Add at least one variant before confirming this product.");
      return;
    }
    const totalStock = row.variants.reduce((sum, v) => sum + (Number.isFinite(v.stock) ? v.stock : 0), 0);
    const created = await createProduct.execute({
      name: row.name,
      price: Number(row.price),
      productCategory: row.productCategory,
      stock: totalStock,
    });
    for (const variant of row.variants) {
      await createVariant.execute({ productId: created.id, input: variant });
    }
    setJustAdded(created.name);
    setConfirmedCount((n) => n + 1);
    setRow((prev) => ({
      ...makeBlankRow(),
      productCategory: lockCategory ? prev.productCategory : "",
      name: lockName ? prev.name : "",
      photoPreview: lockPhoto ? prev.photoPreview : null,
    }));
    refetch();
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>Add Product Engine</h1>
          <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
            Use one simple product row, then add its variants below. For {currentStore?.name ?? "your store"}.
          </p>
        </div>
        <Badge label={`${confirmedCount} confirmed`} tone={confirmedCount > 0 ? "success" : "neutral"} />
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Product Image", "Product Name", "Category Name", "UOM", "Price (₱)", "Product Description", "Variants", "Actions"].map(
                  (col) => (
                    <th key={col} style={{ ...styles.th, color: theme.colors.textSecondary, borderColor: theme.colors.border }}>
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <label style={styles.photoPicker}>
                    {row.photoPreview ? (
                      <img src={row.photoPreview} alt="Product preview" style={styles.photoPreviewImg} />
                    ) : (
                      <span style={{ color: theme.colors.textSecondary, fontSize: 12 }}>📷 Image</span>
                    )}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhotoSelected(e.target.files?.[0])} />
                  </label>
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <Input value={row.name} onChange={(e) => setRow((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter product name" />
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <Input
                    value={row.productCategory}
                    onChange={(e) => setRow((prev) => ({ ...prev, productCategory: e.target.value }))}
                    placeholder="e.g. Ulam"
                  />
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <Input value={row.uom} onChange={(e) => setRow((prev) => ({ ...prev, uom: e.target.value }))} placeholder="e.g. piece, kg" />
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) => setRow((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 99"
                  />
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <Input
                    value={row.description}
                    onChange={(e) => setRow((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short customer description"
                  />
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  {row.variants.length === 0 ? (
                    <Badge label="0 variants" tone="warning" />
                  ) : (
                    <Badge label={`${row.variants.length} variant${row.variants.length > 1 ? "s" : ""}`} tone="info" />
                  )}
                </td>
                <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button label="Add Variant" size="sm" variant="outline" onClick={() => setVariantModalOpen(true)} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {row.photoPreview ? <Badge label="Photo not saved yet -- needs a confirmed Xano image-upload endpoint" tone="neutral" /> : null}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.colors.textSecondary }}>
            <input type="checkbox" checked={lockCategory} onChange={(e) => setLockCategory(e.target.checked)} /> 🔒 Keep category for next product
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.colors.textSecondary }}>
            <input type="checkbox" checked={lockName} onChange={(e) => setLockName(e.target.checked)} /> 🔒 Keep name for next product
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.colors.textSecondary }}>
            <input type="checkbox" checked={lockPhoto} onChange={(e) => setLockPhoto(e.target.checked)} /> 🔒 Keep photo for next product
          </label>
        </div>

        {!canConfirm ? (
          <p style={{ color: theme.colors.textSecondary, fontSize: 12, margin: 0 }}>
            Name, category, price and at least 1 variant are required before this product can be confirmed.
          </p>
        ) : null}
        {rowError ? <ErrorState description={rowError} /> : null}
        {createProduct.error ? <ErrorState description={createProduct.error} /> : null}
        {createVariant.error ? <ErrorState description={createVariant.error} /> : null}

        <Button
          label={createProduct.loading || createVariant.loading ? "Confirming…" : "Confirm Product"}
          loading={createProduct.loading || createVariant.loading}
          disabled={!canConfirm}
          onClick={handleConfirm}
        />
        {justAdded ? <Badge label={`${justAdded} confirmed ✓ -- keep adding, or leave this screen when done`} tone="success" /> : null}
      </div>

      {variantModalOpen ? (
        <VariantModal
          variants={row.variants}
          onClose={() => setVariantModalOpen(false)}
          onSave={(variants) =>
            setRow((prev) => ({
              ...prev,
              variants,
              // First variant's photo becomes the product's display photo, if the row has none of its own yet.
              photoPreview: prev.photoPreview ?? variants[0]?.imagePreview ?? null,
            }))
          }
        />
      ) : null}

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <h2 style={{ ...styles.sectionTitle, color: theme.colors.textPrimary, margin: 0 }}>Have a lot of products?</h2>
        <p style={{ color: theme.colors.textSecondary, fontSize: 13, margin: 0 }}>
          Upload a CSV file (columns: name, price, category, stock). Have a Google Sheet? In Google Sheets, use
          File → Download → Comma Separated Values (.csv), then upload that file here.
        </p>
        <label style={styles.csvButton}>
          {importCsv.loading ? "Importing…" : "Upload CSV file"}
          <input type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(e) => handleCsvSelected(e.target.files?.[0])} />
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
        <EmptyState title="No products yet" description="Products you confirm will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((product) => (
            <div key={product.id} style={{ ...styles.productRow, borderColor: theme.colors.border, background: theme.colors.surface }}>
              <div>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>{product.name}</span>
                <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  {product.productCategory || "Uncategorized"} · {product.variantCount} variant{product.variantCount === 1 ? "" : "s"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge label={product.isActive ? "Active" : "Inactive"} tone={product.isActive ? "success" : "neutral"} />
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>{formatPeso(product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type DraftVariant = { id: string; name: string; priceDelta: number; stock: number; sku: string; imagePreview: string | null };
type DraftRow = {
  name: string;
  productCategory: string;
  uom: string;
  price: string;
  description: string;
  photoPreview: string | null;
  variants: DraftVariant[];
};

function makeBlankRow(): DraftRow {
  return { name: "", productCategory: "", uom: "", price: "", description: "", photoPreview: null, variants: [] };
}

function makeBlankVariant(): DraftVariant {
  return { id: `variant-${Math.random().toString(36).slice(2, 9)}`, name: "", priceDelta: 0, stock: 0, sku: "", imagePreview: null };
}

/**
 * Popup for the row's "Add Variant" action. A product can't be confirmed
 * with zero rows here -- every RAPEX listing needs at least a default
 * size/quantity variant (e.g. "Regular", "1kg", "Solo").
 */
function VariantModal({
  variants,
  onClose,
  onSave,
}: {
  variants: DraftVariant[];
  onClose: () => void;
  onSave: (variants: DraftVariant[]) => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState<DraftVariant[]>(variants.length > 0 ? variants : [makeBlankVariant()]);

  function updateVariant(id: string, patch: Partial<DraftVariant>) {
    setDraft((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function handleImage(id: string, file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateVariant(id, { imagePreview: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  }

  const validDraft = draft.filter((v) => v.name.trim().length > 0);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{ ...styles.modalCard, background: theme.colors.surface, borderColor: theme.colors.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, color: theme.colors.textPrimary, fontSize: 18 }}>Product Variants</h2>
        <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: 13 }}>
          Every product needs at least one variant (e.g. size or quantity). The first variant's photo becomes the product's
          display photo if you haven't set one already.
        </p>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Photo", "Variant Name", "Price add-on (₱)", "Stock", "SKU", ""].map((col) => (
                  <th key={col} style={{ ...styles.th, color: theme.colors.textSecondary, borderColor: theme.colors.border }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.map((variant, index) => (
                <tr key={variant.id}>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    <label style={{ ...styles.photoPicker, height: 56, width: 56 }}>
                      {variant.imagePreview ? (
                        <img src={variant.imagePreview} alt="" style={styles.photoPreviewImg} />
                      ) : (
                        <span style={{ color: theme.colors.textSecondary, fontSize: 10 }}>📷</span>
                      )}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImage(variant.id, e.target.files?.[0])} />
                    </label>
                    {index === 0 ? <Badge label="Main image" tone="brand" /> : null}
                  </td>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    <Input value={variant.name} onChange={(e) => updateVariant(variant.id, { name: e.target.value })} placeholder="e.g. Regular, 1kg" />
                  </td>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    <Input
                      type="number"
                      value={String(variant.priceDelta)}
                      onChange={(e) => updateVariant(variant.id, { priceDelta: Number(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </td>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    <Input
                      type="number"
                      value={String(variant.stock)}
                      onChange={(e) => updateVariant(variant.id, { stock: Number(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </td>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    <Input value={variant.sku} onChange={(e) => updateVariant(variant.id, { sku: e.target.value })} placeholder="SKU" />
                  </td>
                  <td style={{ ...styles.td, borderColor: theme.colors.border }}>
                    {draft.length > 1 ? (
                      <Button label="Remove" size="sm" variant="danger" onClick={() => setDraft((prev) => prev.filter((v) => v.id !== variant.id))} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button label="+ Add another variant" size="sm" variant="outline" onClick={() => setDraft((prev) => [...prev, makeBlankVariant()])} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Save Variants"
            disabled={validDraft.length === 0}
            onClick={() => {
              onSave(validDraft);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 960, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  card: { border: "1px solid", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, margin: "8px 0 0" },
  productRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: "1px solid" },
  photoPicker: {
    height: 64,
    width: 64,
    borderRadius: 12,
    border: "2px dashed rgba(139, 92, 246, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    flexShrink: 0,
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
  tableScroll: { overflowX: "auto" },
  table: { borderCollapse: "collapse", width: "100%", minWidth: 780 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, padding: "8px 10px", borderBottom: "1px solid" },
  td: { padding: "8px 10px", borderBottom: "1px solid", minWidth: 120, verticalAlign: "top" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 50,
  },
  modalCard: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
};
