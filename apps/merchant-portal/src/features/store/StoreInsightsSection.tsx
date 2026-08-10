import { useTheme } from "@rapex/ui-web";
import { HqSectionCard } from "./HqSectionCard";

const INSIGHTS = [
  { icon: "📈", text: "Your Grocery products are trending." },
  { icon: "🥤", text: "Customers nearby are searching for beverages." },
  { icon: "🛠", text: "Hardware sales increased today." },
  { icon: "🍱", text: "Lunch meals are trending around Lancaster." },
];

export function StoreInsightsSection() {
  const theme = useTheme();

  return (
    <HqSectionCard
      emoji="📊"
      title="Store Insights"
      color="indigo"
      right={<span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>AI Powered</span>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: theme.spacing.md }}>
        {INSIGHTS.map((insight, i) => (
          <div
            key={i}
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.md,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <span style={{ fontSize: 20 }}>{insight.icon}</span>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{insight.text}</span>
          </div>
        ))}
      </div>
    </HqSectionCard>
  );
}
