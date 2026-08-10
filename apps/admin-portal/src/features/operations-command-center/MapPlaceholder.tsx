import { useTheme } from "@rapex/ui-web";
import type { Merchant, Rider } from "./types";
import { RIDER_STATUS_LABEL, MERCHANT_STATUS_LABEL, riderStatusColor, merchantStatusColor } from "./statusStyles";

type MapPlaceholderProps = {
  riders: Rider[];
  merchants: Merchant[];
  onSelectRider: (rider: Rider) => void;
  onSelectMerchant: (merchant: Merchant) => void;
};

export function MapPlaceholder({ riders, merchants, onSelectRider, onSelectMerchant }: MapPlaceholderProps) {
  const theme = useTheme();

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          position: "relative",
          margin: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surfaceAlt,
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.08) 26%, transparent 27%, transparent 74%, rgba(128,128,128,0.08) 75%, rgba(128,128,128,0.08) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.08) 26%, transparent 27%, transparent 74%, rgba(128,128,128,0.08) 75%, rgba(128,128,128,0.08) 76%, transparent 77%, transparent)",
          backgroundSize: "40px 40px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: theme.spacing.sm,
            left: theme.spacing.sm,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.surface,
            padding: `${theme.spacing.xxs}px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.sm,
          }}
        >
          Live map placeholder — Google Maps integration comes later
        </div>

        {riders.map((rider) => (
          <button
            key={rider.id}
            type="button"
            title={`${rider.name} — ${RIDER_STATUS_LABEL[rider.status]}`}
            onClick={() => onSelectRider(rider)}
            style={{
              position: "absolute",
              left: `${rider.x}%`,
              top: `${rider.y}%`,
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: `2px solid ${theme.colors.surface}`,
              backgroundColor: riderStatusColor(rider.status, theme),
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}

        {merchants.map((merchant) => (
          <button
            key={merchant.id}
            type="button"
            title={`${merchant.storeName} — ${MERCHANT_STATUS_LABEL[merchant.status]}`}
            onClick={() => onSelectMerchant(merchant)}
            style={{
              position: "absolute",
              left: `${merchant.x}%`,
              top: `${merchant.y}%`,
              transform: "translate(-50%, -50%)",
              width: 18,
              height: 18,
              borderRadius: theme.radius.sm,
              border: `2px solid ${theme.colors.surface}`,
              backgroundColor: merchantStatusColor(merchant.status, theme),
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: theme.spacing.lg,
          padding: `0 ${theme.spacing.lg}px ${theme.spacing.lg}px`,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.textSecondary,
        }}
      >
        <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700 }}>Riders (●):</span>
          {(Object.keys(RIDER_STATUS_LABEL) as Array<keyof typeof RIDER_STATUS_LABEL>).map((status) => (
            <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: riderStatusColor(status, theme),
                }}
              />
              {RIDER_STATUS_LABEL[status]}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          padding: `0 ${theme.spacing.lg}px ${theme.spacing.lg}px`,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.textSecondary,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700 }}>Merchants (■):</span>
        {(Object.keys(MERCHANT_STATUS_LABEL) as Array<keyof typeof MERCHANT_STATUS_LABEL>).map((status) => (
          <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: merchantStatusColor(status, theme),
              }}
            />
            {MERCHANT_STATUS_LABEL[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
