import { useState } from "react";
import Papa from "papaparse";
import { Button, DataTable, type DataTableColumn, EmptyState, Input, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { DraftProduct } from "@rapex/api-client";
import type { WizardDraft } from "./OnboardingWizard";

type StepProductsProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

let draftProductSeq = 1;

export function StepProducts({ draft, update }: StepProductsProps) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");

  const addProduct = () => {
    if (!name || !price) return;
    const product: DraftProduct = { id: `local-${draftProductSeq++}`, name, price: Number(price), productCategory };
    update({ draftProducts: [...draft.draftProducts, product] });
    setName("");
    setPrice("");
    setProductCategory("");
  };

  const removeProduct = (id: string) => update({ draftProducts: draft.draftProducts.filter((p) => p.id !== id) });

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { data } = Papa.parse<Record<string, string>>(String(reader.result ?? ""), { header: true, skipEmptyLines: true });
      const imported: DraftProduct[] = data
        .map((raw) => ({
          id: `local-${draftProductSeq++}`,
          name: (raw.name ?? raw.Name ?? "").trim(),
          price: Number(raw.price ?? raw.Price),
          productCategory: (raw.category ?? raw.productCategory ?? raw.Category ?? "").trim(),
        }))
        .filter((p) => p.name && Number.isFinite(p.price));
      update({ draftProducts: [...draft.draftProducts, ...imported] });
    };
    reader.readAsText(file);
  };

  const columns: DataTableColumn<DraftProduct>[] = [
    { key: "name", header: "Product", render: (p) => p.name },
    { key: "category", header: "Category", render: (p) => p.productCategory || "—" },
    { key: "price", header: "Price", render: (p) => formatPeso(p.price) },
    { key: "actions", header: "", render: (p) => <Button label="Remove" size="sm" variant="outline" onClick={() => removeProduct(p.id)} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        Stage your first products now, or skip and add them later from your Store dashboard.
      </span>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Category" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} />
        <Button label="+ Add Product" onClick={addProduct} disabled={!name || !price} />
      </div>

      <div>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importCsv(file);
          }}
          style={{ fontSize: theme.typography.fontSize.sm }}
        />
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm }}>
          Import CSV — columns: name, price, category
        </span>
      </div>

      {draft.draftProducts.length === 0 ? (
        <EmptyState title="No products staged yet" description="You can always add products after your store is approved." />
      ) : (
        <DataTable columns={columns} rows={draft.draftProducts} rowKey={(p) => p.id} pageSize={6} emptyMessage="No products staged yet" />
      )}
    </div>
  );
}
