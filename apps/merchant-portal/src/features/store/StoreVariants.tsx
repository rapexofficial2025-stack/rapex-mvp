import { Button, DataTable, type DataTableColumn, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { ProductVariant } from "@rapex/api-client";

type StoreVariantsProps = {
  productName: string;
  variants: ProductVariant[];
  onAddVariant: () => void;
  onDeleteVariant: (variantId: string) => void;
  onClose: () => void;
};

export function StoreVariants({ productName, variants, onAddVariant, onDeleteVariant, onClose }: StoreVariantsProps) {
  const theme = useTheme();

  const columns: DataTableColumn<ProductVariant>[] = [
    { key: "name", header: "Variant", render: (v) => v.name, sortValue: (v) => v.name },
    { key: "sku", header: "SKU", render: (v) => v.sku },
    { key: "priceDelta", header: "Price Adjustment", render: (v) => `${v.priceDelta >= 0 ? "+" : ""}${formatPeso(v.priceDelta)}`, sortValue: (v) => v.priceDelta },
    { key: "stock", header: "Stock", render: (v) => v.stock, sortValue: (v) => v.stock },
    {
      key: "actions",
      header: "",
      render: (v) => (
        <Button label="Remove" size="sm" variant="outline" onClick={() => onDeleteVariant(v.id)} />
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
          Variants — {productName}
        </h4>
        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          <Button label="+ Add Variant" size="sm" onClick={onAddVariant} />
          <Button label="Close" size="sm" variant="outline" onClick={onClose} />
        </div>
      </div>
      <DataTable columns={columns} rows={variants} rowKey={(v) => v.id} pageSize={5} emptyMessage="No variants for this product yet" />
    </div>
  );
}
