import { useState } from "react";
import { Button, GlassCard, useTheme } from "@rapex/ui-web";
import type { MerchantStore } from "@rapex/api-client";
import { ProductCsvImportModal } from "./ProductCsvImportModal";

type CsvImportPanelProps = {
  store: MerchantStore;
  onImported: () => void;
};

export function CsvImportPanel({ store, onImported }: CsvImportPanelProps) {
  const theme = useTheme();
  const [showImport, setShowImport] = useState(false);

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>CSV Import</h3>
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
            Bulk-add products to {store.name} from a CSV file.
          </span>
        </div>
        <Button label="Import CSV" size="sm" onClick={() => setShowImport(true)} />
      </div>

      {showImport ? (
        <ProductCsvImportModal
          storeId={store.id}
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            onImported();
          }}
        />
      ) : null}
    </GlassCard>
  );
}
