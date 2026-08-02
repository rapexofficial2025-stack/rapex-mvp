import { DataTable, type DataTableColumn, EmptyState, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { formatDateTime } from "@rapex/utils";
import { useEngineHistory, type EngineChangeLogEntry, type EngineKey } from "@rapex/api-client";

type EngineHistoryPanelProps = {
  engineKey: EngineKey;
};

export function EngineHistoryPanel({ engineKey }: EngineHistoryPanelProps) {
  const theme = useTheme();
  const { data: history, loading, error, refetch } = useEngineHistory(engineKey);

  const columns: DataTableColumn<EngineChangeLogEntry>[] = [
    { key: "summary", header: "Change", render: (h) => h.summary },
    { key: "changedBy", header: "Changed By", render: (h) => h.changedBy },
    { key: "changedAt", header: "When", render: (h) => formatDateTime(h.changedAt), sortValue: (h) => new Date(h.changedAt).getTime() },
  ];

  return (
    <GlassCard>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>
        Change History
      </h3>
      {loading ? (
        <Loading label="Loading history…" />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : !history || history.length === 0 ? (
        <EmptyState title="No changes yet" description="Every rule added, updated, or removed here will be logged." />
      ) : (
        <DataTable columns={columns} rows={history} rowKey={(h) => h.id} pageSize={5} emptyMessage="No changes yet" />
      )}
    </GlassCard>
  );
}
