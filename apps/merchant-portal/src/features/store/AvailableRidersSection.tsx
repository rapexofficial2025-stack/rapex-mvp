import { Badge, DataTable, type DataTableColumn, useTheme } from "@rapex/ui-web";
import { HqSectionCard } from "./HqSectionCard";
import { NEARBY_RIDERS_MOCK, type MockRider, type MockRiderStatus } from "./ridersMockData";

const STATUS_TONE: Record<MockRiderStatus, "success" | "warning" | "neutral"> = {
  online: "success",
  delivering: "warning",
  offline: "neutral",
};

export function AvailableRidersSection() {
  const theme = useTheme();

  const columns: DataTableColumn<MockRider>[] = [
    { key: "rider", header: "Rider", render: (r) => `${r.avatar} ${r.name}`, sortValue: (r) => r.name },
    { key: "vehicle", header: "Vehicle", render: (r) => r.vehicle },
    { key: "distance", header: "Distance", render: (r) => `${r.distanceKm} km`, sortValue: (r) => r.distanceKm },
    { key: "eta", header: "Avg. Pickup Time", render: (r) => `${r.pickupEtaMinutes} min`, sortValue: (r) => r.pickupEtaMinutes },
    { key: "status", header: "Status", render: (r) => <Badge label={r.status} tone={STATUS_TONE[r.status]} /> },
  ];

  return (
    <HqSectionCard emoji="🚚" title="Available Riders" color="emerald">
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, display: "block" }}>
        Riders currently near your stores.
      </span>
      <DataTable columns={columns} rows={NEARBY_RIDERS_MOCK} rowKey={(r) => r.id} pageSize={5} emptyMessage="No riders nearby" />
    </HqSectionCard>
  );
}
