import { Badge, DataTable, type DataTableColumn, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { useNearbyRiders, type MerchantStore, type NearbyRider, type RiderAvailability } from "@rapex/api-client";

type NearbyRidersProps = {
  store: MerchantStore;
};

const AVAILABILITY_TONE: Record<RiderAvailability, "success" | "warning" | "neutral"> = {
  available: "success",
  busy: "warning",
  offline: "neutral",
};

export function NearbyRiders({ store }: NearbyRidersProps) {
  const theme = useTheme();
  const { data: riders, loading, error, refetch } = useNearbyRiders(store.id);

  const columns: DataTableColumn<NearbyRider>[] = [
    { key: "name", header: "Rider", render: (r) => r.name, sortValue: (r) => r.name },
    { key: "vehicle", header: "Vehicle", render: (r) => r.vehicleType },
    { key: "distance", header: "Distance", render: (r) => `${r.distanceKm} km`, sortValue: (r) => r.distanceKm },
    { key: "rating", header: "Rating", render: (r) => `${r.rating} ⭐`, sortValue: (r) => r.rating },
    {
      key: "availability",
      header: "Availability",
      render: (r) => <Badge label={r.availability} tone={AVAILABILITY_TONE[r.availability]} />,
    },
  ];

  return (
    <GlassCard>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>
        Nearby Riders
      </h3>
      {loading ? (
        <Loading label="Finding riders near this store…" />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={riders ?? []}
          rowKey={(r) => r.id}
          searchPlaceholder="Search riders…"
          searchFn={(r, q) => r.name.toLowerCase().includes(q) || r.vehicleType.toLowerCase().includes(q)}
          pageSize={5}
          emptyMessage="No riders currently nearby"
        />
      )}
    </GlassCard>
  );
}
