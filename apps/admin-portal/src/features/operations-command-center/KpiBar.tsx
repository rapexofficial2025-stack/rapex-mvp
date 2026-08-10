import { useTheme } from "@rapex/ui-web";
import type { Merchant, Rider } from "./types";
import { formatPeso } from "@rapex/utils";

type KpiBarProps = {
  riders: Rider[];
  merchants: Merchant[];
};

export function KpiBar({ riders, merchants }: KpiBarProps) {
  const theme = useTheme();

  const onlineRiders = riders.filter((r) => r.status === "online-available" || r.status === "online-delivering").length;
  const busyRiders = riders.filter((r) => r.status === "online-delivering").length;
  const offlineRiders = riders.filter((r) => r.status === "offline").length;
  const barangayRiders = riders.filter((r) => r.status === "barangay-dedicated").length;
  const onlineMerchants = merchants.filter((m) => m.status === "open" || m.status === "busy").length;
  const offlineMerchants = merchants.filter((m) => m.status === "closed" || m.status === "paused").length;
  const ordersToday = merchants.reduce((sum, m) => sum + m.ordersToday, 0);
  const ordersInProgress = merchants.reduce((sum, m) => sum + m.preparingOrders + m.pendingOrders, 0);
  const completedToday = merchants.reduce((sum, m) => sum + m.completedOrdersToday, 0);
  const cancelledToday = merchants.reduce((sum, m) => sum + m.cancelledOrdersToday, 0);
  const revenueToday = merchants.reduce((sum, m) => sum + m.revenueToday, 0);
  const commissionToday = merchants.reduce((sum, m) => sum + m.commissionToday, 0);

  const tiles: { label: string; value: string }[] = [
    { label: "Online Riders", value: String(onlineRiders) },
    { label: "Busy Riders", value: String(busyRiders) },
    { label: "Offline Riders", value: String(offlineRiders) },
    { label: "Barangay Riders", value: String(barangayRiders) },
    { label: "Online Merchants", value: String(onlineMerchants) },
    { label: "Offline Merchants", value: String(offlineMerchants) },
    { label: "Orders Today", value: String(ordersToday) },
    { label: "Orders In Progress", value: String(ordersInProgress) },
    { label: "Completed Today", value: String(completedToday) },
    { label: "Cancelled Today", value: String(cancelledToday) },
    { label: "Revenue Today", value: formatPeso(revenueToday) },
    { label: "Platform Commission Today", value: formatPeso(commissionToday) },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: theme.spacing.sm,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          style={{
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            padding: theme.spacing.sm,
          }}
        >
          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{tile.label}</div>
          <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
            {tile.value}
          </div>
        </div>
      ))}
    </div>
  );
}
