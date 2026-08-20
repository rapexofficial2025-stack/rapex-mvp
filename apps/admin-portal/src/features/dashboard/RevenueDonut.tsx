import { formatPeso } from "@rapex/utils";
import type { RevenueBreakdownSlice } from "@rapex/api-client";
import { PortalInteractiveDonutChart, type PortalDonutSlice } from "../../shared/portal-ui/PortalInteractiveCharts";

const LABELS: Record<RevenueBreakdownSlice["label"], string> = {
  merchants: "Merchants",
  riders: "Riders",
  "platform-fee": "Platform Fee",
};

export function RevenueDonut({ slices }: { slices: RevenueBreakdownSlice[] }) {
  const tones: PortalDonutSlice["tone"][] = ["lavender", "yellow", "mint"];

  return (
    <PortalInteractiveDonutChart
      ariaLabel="Revenue breakdown"
      totalLabel="Total Revenue"
      formatValue={formatPeso}
      slices={slices.map((slice, index) => ({
        label: LABELS[slice.label],
        value: slice.amount,
        tone: tones[index % tones.length]!,
      }))}
    />
  );
}
