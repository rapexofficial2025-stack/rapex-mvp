import { Button, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { Rider } from "./types";
import { RIDER_STATUS_LABEL, riderStatusColor } from "./statusStyles";

type RiderInfoCardProps = {
  rider: Rider;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.sm }}>
      <span style={{ color: theme.colors.textSecondary }}>{label}</span>
      <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function RiderInfoCard({ rider, onClose }: RiderInfoCardProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        width: 300,
        maxHeight: `calc(100% - ${theme.spacing.lg * 2}px)`,
        overflowY: "auto",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.lg.css,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: theme.spacing.sm, alignItems: "center" }}>
          {rider.photoUrl ? (
            <img
              src={rider.photoUrl}
              alt=""
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.colors.border}` }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.surfaceAlt,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: 700,
                color: theme.colors.textSecondary,
              }}
            >
              {rider.name.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
              {rider.name}
            </div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{rider.vehicle}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer", fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary }}
        >
          ×
        </button>
      </div>

      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: riderStatusColor(rider.status, theme),
              display: "inline-block",
            }}
          />
          {RIDER_STATUS_LABEL[rider.status]}
        </span>
      </div>

      <Field label="Mobile Number" value={rider.phone} />
      <Field label="Plate Number" value={rider.plateNumber} />
      <Field label="License No." value={rider.licenseNumber} />
      <Field label="Current Speed" value={`${rider.currentSpeedKph} km/h`} />
      <Field label="Battery" value={rider.batteryPercent === null ? "N/A" : `${rider.batteryPercent}%`} />
      <Field label="Current Location" value={`${rider.barangay}, ${rider.municipality}`} />
      <Field label="Today's Deliveries" value={rider.todayDeliveries} />
      <Field label="Completed Deliveries" value={rider.completedDeliveries} />
      <Field label="Current Earnings" value={formatPeso(rider.currentEarnings)} />
      <Field label="Acceptance Rate" value={`${rider.acceptanceRatePercent}%`} />
      <Field label="Assigned Orders" value={rider.assignedOrderIds.length ? rider.assignedOrderIds.join(", ") : "None"} />
      <Field label="Wallet" value={formatPeso(rider.walletBalance)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
        <Button label="Call" size="sm" />
        <Button label="Chat" size="sm" variant="secondary" />
        <Button label="Assign Order" size="sm" variant="secondary" />
        <Button label="Pause" size="sm" variant="outline" />
        <Button label="View Timeline" size="sm" variant="outline" />
      </div>
    </div>
  );
}
