import { useTheme } from "@rapex/ui-web";
import { HqSectionCard } from "./HqSectionCard";

const ACTIVITY = [
  { icon: "🧾", text: "New order received — ORD-2026-0526-004", time: "2 min ago" },
  { icon: "👀", text: "JB Grocery was viewed by a customer", time: "8 min ago" },
  { icon: "👥", text: "New follower on Jenny's Carenderia", time: "15 min ago" },
  { icon: "✅", text: "Product sold: Cement (JB's Hardware)", time: "27 min ago" },
  { icon: "🚀", text: "Boost activated on JB Grocery", time: "1 hour ago" },
  { icon: "⭐", text: "Customer saved JB's Hardware to favorites", time: "2 hours ago" },
];

export function ActivityTimelineSection() {
  const theme = useTheme();

  return (
    <HqSectionCard emoji="📝" title="Activity Timeline" color="slate">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {ACTIVITY.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: theme.spacing.md }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {i < ACTIVITY.length - 1 ? <div style={{ flex: 1, width: 1, backgroundColor: theme.colors.border, minHeight: 20 }} /> : null}
            </div>
            <div style={{ paddingBottom: theme.spacing.md }}>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{item.text}</div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </HqSectionCard>
  );
}
