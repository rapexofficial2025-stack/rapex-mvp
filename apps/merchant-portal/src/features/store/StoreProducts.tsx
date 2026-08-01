import { useState } from "react";
import { Badge, Button, DataTable, type DataTableColumn, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantProduct } from "@rapex/api-client";

type StoreProductsProps = {
  products: MerchantProduct[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
  onAddProduct: () => void;
};

export function StoreProducts({ products, selectedProductId, onSelectProduct, onAddProduct }: StoreProductsProps) {
  const theme = useTheme();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const columns: DataTableColumn<MerchantProduct>[] = [
    { key: "image", header: "", render: (p) => <span style={{ fontSize: 18 }}>{p.imageLabel}</span> },
    { key: "name", header: "Product", render: (p) => p.name, sortValue: (p) => p.name },
    { key: "category", header: "Category", render: (p) => p.productCategory, sortValue: (p) => p.productCategory },
    { key: "price", header: "Price", render: (p) => formatPeso(p.price), sortValue: (p) => p.price },
    { key: "stock", header: "Stock", render: (p) => p.stock, sortValue: (p) => p.stock },
    { key: "variants", header: "Variants", render: (p) => p.variantCount },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge label={p.isActive ? "Active" : "Inactive"} tone={p.isActive ? "success" : "neutral"} />,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>Products</h3>
        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          {selectedKeys.size > 0 ? (
            <Button label={`Bulk Actions (${selectedKeys.size})`} variant="secondary" size="sm" onClick={() => {}} />
          ) : null}
          <Button label="+ Add Product" size="sm" onClick={onAddProduct} />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={products}
        rowKey={(p) => p.id}
        searchPlaceholder="Search products…"
        searchFn={(p, q) => p.name.toLowerCase().includes(q) || p.productCategory.toLowerCase().includes(q)}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        pageSize={5}
        emptyMessage="No products in this store yet"
        onRowClick={(p) => onSelectProduct(p.id)}
      />
      {selectedProductId ? (
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          Viewing variants for the selected product below.
        </span>
      ) : null}
    </div>
  );
}
