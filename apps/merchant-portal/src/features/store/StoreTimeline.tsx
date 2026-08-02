import { EmptyState, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { formatDateTime } from "@rapex/utils";
import { useStoreTimeline, type MerchantStore, type StoreTimelineEventType } from "@rapex/api-client";

type StoreTimelineProps = {
  store: MerchantStore;
};

const TYPE_ICON: Record<StoreTimelineEventType, string> = {
  order: "🧾",
  store: "🏪",
  product: "📦",
  system: "⚙️",
};

export function StoreTimeline({ store }: StoreTimelineProps) {
  const theme = useTheme();
  const { data: events, loading, error, refetch } = useStoreTimeline(store.id);

  return (
    <GlassCard>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>
        Timeline
      </h3>
      {loading ? (
        <Loading label="Loading activity…" />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : !events || events.length === 0 ? (
        <EmptyState title="No activity yet" description="Store activity will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[...events]
            .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
            .map((event, i, arr) => (
              <div key={event.id} style={{ display: "flex", gap: theme.spacing.md }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>{TYPE_ICON[event.type]}</span>
                  {i < arr.length - 1 ? <div style={{ flex: 1, width: 1, backgroundColor: theme.colors.border, minHeight: 24 }} /> : null}
                </div>
                <div style={{ paddingBottom: theme.spacing.md }}>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{event.message}</div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                    {formatDateTime(event.occurredAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </GlassCard>
  );
}
