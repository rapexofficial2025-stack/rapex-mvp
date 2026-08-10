import { useTheme } from "@rapex/ui-web";
import type { ActivityEvent } from "./types";
import { ACTIVITY_LABEL } from "./statusStyles";

type ActivityFeedProps = {
  events: ActivityEvent[];
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        width: 280,
        backgroundColor: theme.colors.surface,
        borderLeft: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, marginBottom: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Live Activity Feed
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surfaceAlt,
              padding: theme.spacing.sm,
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.xs, fontWeight: 700, color: theme.colors.brandPrimary }}>
              {ACTIVITY_LABEL[event.type]}
            </div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{event.message}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{event.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
