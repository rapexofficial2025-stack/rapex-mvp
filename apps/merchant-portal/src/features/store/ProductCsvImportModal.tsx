import { useState } from "react";
import Papa from "papaparse";
import { Badge, Button, DataTable, type DataTableColumn, ErrorState, Modal, useTheme } from "@rapex/ui-web";
import { useBulkImportProductsAction, type ProductImportRow } from "@rapex/api-client";

type ProductCsvImportModalProps = {
  storeId: string;
  onClose: () => void;
  onImported: () => void;
};

type ParsedRow = ProductImportRow & { valid: boolean };

function parseCsv(text: string): ParsedRow[] {
  const { data } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  return data.map((raw) => {
    const name = (raw.name ?? raw.Name ?? "").trim();
    const price = Number(raw.price ?? raw.Price);
    const productCategory = (raw.category ?? raw.productCategory ?? raw.Category ?? "").trim();
    const stock = Number(raw.stock ?? raw.Stock ?? 0);
    return { name, price, productCategory, stock: Number.isFinite(stock) ? stock : 0, valid: !!name && Number.isFinite(price) };
  });
}

export function ProductCsvImportModal({ storeId, onClose, onImported }: ProductCsvImportModalProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const bulkImport = useBulkImportProductsAction();

  const validCount = rows.filter((r) => r.valid).length;

  const columns: DataTableColumn<ParsedRow>[] = [
    { key: "name", header: "Name", render: (r) => r.name || "—" },
    { key: "category", header: "Category", render: (r) => r.productCategory || "—" },
    { key: "price", header: "Price", render: (r) => (Number.isFinite(r.price) ? r.price : "—") },
    { key: "stock", header: "Stock", render: (r) => r.stock },
    { key: "status", header: "Status", render: (r) => <Badge label={r.valid ? "Valid" : "Invalid"} tone={r.valid ? "success" : "error"} /> },
  ];

  return (
    <Modal
      title="Import Products from CSV"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={`Import ${validCount} Product${validCount === 1 ? "" : "s"}`}
            loading={bulkImport.loading}
            disabled={validCount === 0}
            onClick={async () => {
              await bulkImport.execute(storeId, rows.filter((r) => r.valid));
              onImported();
            }}
          />
        </>
      }
    >
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        CSV columns: <code>name, price, category, stock</code>
      </span>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFileName(file.name);
          const reader = new FileReader();
          reader.onload = () => setRows(parseCsv(String(reader.result ?? "")));
          reader.readAsText(file);
        }}
        style={{ fontSize: theme.typography.fontSize.sm }}
      />

      {fileName ? (
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          {fileName} — {rows.length} row(s) parsed, {validCount} valid
        </span>
      ) : null}

      {rows.length > 0 ? (
        <DataTable columns={columns} rows={rows} rowKey={(r) => `${r.name}-${r.price}-${rows.indexOf(r)}`} pageSize={5} emptyMessage="No rows" />
      ) : null}

      {bulkImport.error ? <ErrorState description={bulkImport.error} /> : null}
    </Modal>
  );
}
