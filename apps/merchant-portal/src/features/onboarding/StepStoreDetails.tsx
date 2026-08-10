import { Button, Input, useTheme } from "@rapex/ui-web";
import { OPERATING_DAYS } from "./businessOptions";
import type { WizardDraft } from "./OnboardingWizard";

type StepStoreDetailsProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

export function StepStoreDetails({ draft, update }: StepStoreDetailsProps) {
  const theme = useTheme();

  const toggleDay = (day: string) => {
    const next = draft.operatingDays.includes(day)
      ? draft.operatingDays.filter((d) => d !== day)
      : [...draft.operatingDays, day];
    update({ operatingDays: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <Input label="Store Name" value={draft.storeName} onChange={(e) => update({ storeName: e.target.value })} />
      <Input label="Branch Name" value={draft.branchName} onChange={(e) => update({ branchName: e.target.value })} placeholder="e.g. Main Branch" />
      <Input label="Description" value={draft.storeDescription} onChange={(e) => update({ storeDescription: e.target.value })} />
      <div style={{ display: "flex", gap: 8 }}>
        <Input label="Business Contact Number" value={draft.businessContactNumber} onChange={(e) => update({ businessContactNumber: e.target.value })} />
        <Input label="Business Email" type="email" value={draft.businessEmail} onChange={(e) => update({ businessEmail: e.target.value })} />
      </div>
      <Input label="Business Hours" value={draft.businessHours} onChange={(e) => update({ businessHours: e.target.value })} placeholder="e.g. 8:00 AM - 8:00 PM" />

      <div>
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Operating Days</span>
        <div style={{ display: "flex", gap: 8, marginTop: theme.spacing.xs }}>
          {OPERATING_DAYS.map((day) => {
            const active = draft.operatingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  border: `1px solid ${active ? theme.colors.brandPrimary : theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                  backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surface,
                  color: active ? theme.colors.textInverse : theme.colors.textPrimary,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: theme.typography.fontSize.xs,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button label={`Delivery ${draft.deliveryAvailable ? "✓" : ""}`} variant={draft.deliveryAvailable ? "primary" : "outline"} onClick={() => update({ deliveryAvailable: !draft.deliveryAvailable })} />
        <Button label={`Pickup ${draft.pickupAvailable ? "✓" : ""}`} variant={draft.pickupAvailable ? "primary" : "outline"} onClick={() => update({ pickupAvailable: !draft.pickupAvailable })} />
      </div>

      <Input label="Store Address" value={draft.storeAddress} onChange={(e) => update({ storeAddress: e.target.value })} />
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        GPS location will be pinned automatically from your address — Google Maps ready.
      </span>
    </div>
  );
}
