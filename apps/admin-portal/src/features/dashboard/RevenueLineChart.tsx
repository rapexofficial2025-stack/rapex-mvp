import { formatPeso } from "@rapex/utils";
import { PortalInteractiveLineChart } from "../../shared/portal-ui/PortalInteractiveCharts";

type Point = { date: string; revenue: number };

export function RevenueLineChart({ points }: { points: Point[] }) {
  return (
    <PortalInteractiveLineChart
      ariaLabel="Revenue trend"
      formatValue={formatPeso}
      points={points.map((point) => ({
        label: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: point.revenue,
      }))}
    />
  );
}
