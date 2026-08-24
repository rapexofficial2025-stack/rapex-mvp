import { Button, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { Merchant } from "./types";
import { MERCHANT_STATUS_LABEL, merchantStatusColor } from "./statusStyles";

type MerchantInfoCardProps = {
  merchant: Merchant;
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

export function MerchantInfoCard({ merchant, onClose }: MerchantInfoCardProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "absolute",
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        width: 320,
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
          {merchant.logoUrl ? (
            <img
              src={merchant.logoUrl}
              alt=""
              style={{ width: 44, height: 44, borderRadius: theme.radius.sm, objectFit: "cover", border: `1px solid ${theme.colors.border}` }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radius.sm,
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
              {merchant.storeName.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
              {merchant.storeName}
            </div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
              {merchant.merchantName} · {merchant.merchantId}
            </div>
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
              backgroundColor: merchantStatusColor(merchant.status, theme),
              display: "inline-block",
            }}
          />
          {MERCHANT_STATUS_LABEL[merchant.status]}
        </span>
      </div>

      <Field label="Mobile Number" value={merchant.phone} />
      <Field label="Current Location" value={`${merchant.barangay}, ${merchant.municipality}`} />
      <Field label="Category" value={merchant.category} />
      <Field label="Open Hours" value={merchant.openHours} />
      <Field label="Today's Orders" value={merchant.ordersToday} />
      <Field label="Completed Today" value={merchant.completedOrdersToday} />
      <Field label="Cancelled Today" value={merchant.cancelledOrdersToday} />
      <Field label="Pending" value={merchant.pendingOrders} />
      <Field label="Preparing" value={merchant.preparingOrders} />
      <Field label="Ready for Pickup" value={merchant.readyForPickupOrders} />
      <Field label="Avg. Prep Time" value={`${merchant.avgPrepTimeMinutes} min`} />
      <Field label="Store Rating" value={`${merchant.rating} ⭐`} />
      <Field label="Wallet Balance" value={formatPeso(merchant.walletBalance)} />
      <Field label="Revenue Today" value={formatPeso(merchant.revenueToday)} />
      <Field label="Commission Today" value={formatPeso(merchant.commissionToday)} />
      <Field label="Voucher Campaign" value={merchant.currentVoucherCampaign ?? "None"} />
      <Field label="Online Staff" value={merchant.onlineStaffCount} />
      <Field label="Last Activity" value={merchant.lastActivity} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
        <Button label="Merchant Profile" size="sm" />
        <Button label="Orders" size="sm" variant="secondary" />
        <Button label="Wallet" size="sm" variant="secondary" />
        <Button label="Analytics" size="sm" variant="secondary" />
        <Button label="Message" size="sm" variant="outline" />
        <Button label="Call" size="sm" variant="outline" />
      </div>
    </div>
  );
}
