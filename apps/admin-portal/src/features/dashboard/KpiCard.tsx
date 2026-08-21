import { PortalMetric } from "../../shared/portal-ui/PortalDashboardPrimitives";

export function KpiCard({
  label,
  value,
  changePercent,
}: {
  label: string;
  value: string;
  changePercent?: number;
}) {
  const isPositive = (changePercent ?? 0) >= 0;
  const tone = label.includes("Revenue") || label.includes("Store") ? "yellow" : label.includes("Completed") || label.includes("Rider") ? "mint" : "lavender";

  return (
    <PortalMetric
      label={label}
      value={value}
      tone={tone}
      detail={
        changePercent !== undefined ? (
          <span style={{ color: isPositive ? "var(--portal-mint)" : "#ff8f9a" }}>
            {isPositive ? "Higher" : "Lower"} by {Math.abs(changePercent).toFixed(1)}% vs yesterday
          </span>
        ) : (
          "Current placeholder snapshot"
        )
      }
    />
  );
}
