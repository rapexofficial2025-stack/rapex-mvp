import { useState } from "react";
import { Badge, Button, DataTable, type DataTableColumn, EmptyState, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import { useEngineTiers, useDeleteEngineTierAction, type EngineTierRule } from "@rapex/api-client";
import type { EngineDef } from "./engines";
import { AddEngineTierModal } from "./AddEngineTierModal";
import { EngineTestCalculator } from "./EngineTestCalculator";
import { EngineHistoryPanel } from "./EngineHistoryPanel";

type EnginePanelProps = {
  engine: EngineDef;
};

export function EnginePanel({ engine }: EnginePanelProps) {
  const theme = useTheme();
  const [showAdd, setShowAdd] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const { data: tiers, loading, error, refetch } = useEngineTiers(engine.key);
  const deleteTier = useDeleteEngineTierAction();

  const columns: DataTableColumn<EngineTierRule>[] = [
    { key: "label", header: "Rule", render: (t) => t.label, sortValue: (t) => t.label },
    { key: "range", header: "From — To", render: (t) => `${formatPeso(t.fromAmount)} — ${t.toAmount === null ? "no limit" : formatPeso(t.toAmount)}` },
    { key: "commission", header: "Commission %", render: (t) => `${t.commissionRatePercent}%`, sortValue: (t) => t.commissionRatePercent },
    { key: "markup", header: "Markup %", render: (t) => `${t.markupRatePercent}%`, sortValue: (t) => t.markupRatePercent },
    { key: "status", header: "Status", render: (t) => <Badge label={t.active ? "Active" : "Inactive"} tone={t.active ? "success" : "neutral"} /> },
    {
      key: "actions",
      header: "",
      render: (t) => (
        <Button
          label="Remove"
          size="sm"
          variant="outline"
          loading={deleteTier.loading}
          onClick={async () => {
            await deleteTier.execute(t.id);
            refetch();
            setHistoryRefreshKey((k) => k + 1);
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: theme.spacing.sm }}>
            <span style={{ fontSize: 28 }}>{engine.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>{engine.label} Engine</h2>
              <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{engine.description}</span>
            </div>
          </div>
          <Button label="+ Add Rule" size="sm" onClick={() => setShowAdd(true)} />
        </div>

        <div style={{ marginTop: theme.spacing.md }}>
          {loading ? (
            <Loading label="Loading rules…" />
          ) : error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : !tiers || tiers.length === 0 ? (
            <EmptyState title="No rules configured" description="Add a rule to start configuring this engine." actionLabel="+ Add Rule" onAction={() => setShowAdd(true)} />
          ) : (
            <DataTable columns={columns} rows={tiers} rowKey={(t) => t.id} pageSize={8} emptyMessage="No rules configured" />
          )}
        </div>
      </GlassCard>

      <EngineTestCalculator tiers={tiers ?? []} />

      <EngineHistoryPanel key={historyRefreshKey} engineKey={engine.key} />

      {showAdd ? (
        <AddEngineTierModal
          engineKey={engine.key}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            refetch();
            setHistoryRefreshKey((k) => k + 1);
          }}
        />
      ) : null}
    </div>
  );
}
