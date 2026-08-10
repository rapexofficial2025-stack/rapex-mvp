import { Badge, Button, Input, useTheme } from "@rapex/ui-web";
import { BUSINESS_STRUCTURES, VAT_STATUSES } from "./businessOptions";
import type { WizardDraft } from "./OnboardingWizard";

type StepDocumentsProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

export function StepDocuments({ draft, update }: StepDocumentsProps) {
  const theme = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        Now let's get your legal documents on file.
      </span>

      <div>
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Business Structure</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: theme.spacing.xs }}>
          {BUSINESS_STRUCTURES.map((structure) => {
            const active = draft.businessStructure === structure.key;
            return (
              <button
                key={structure.key}
                type="button"
                onClick={() => update({ businessStructure: structure.key })}
                style={{
                  border: `1px solid ${active ? theme.colors.brandPrimary : theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                  backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surface,
                  color: active ? theme.colors.textInverse : theme.colors.textPrimary,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                {structure.label}
              </button>
            );
          })}
        </div>
      </div>

      <DocRow label="Mayor's Permit" done={draft.mayorsPermitUploaded} onUpload={() => update({ mayorsPermitUploaded: true })} />
      <DocRow label="BIR Registration" done={draft.birRegistrationUploaded} onUpload={() => update({ birRegistrationUploaded: true })} />
      <Input label="TIN" value={draft.tin} onChange={(e) => update({ tin: e.target.value })} />

      <div>
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>VAT Status</span>
        <div style={{ display: "flex", gap: 8, marginTop: theme.spacing.xs }}>
          {VAT_STATUSES.map((status) => (
            <Button
              key={status.key}
              label={status.label}
              size="sm"
              variant={draft.vatStatus === status.key ? "primary" : "outline"}
              onClick={() => update({ vatStatus: status.key })}
            />
          ))}
        </div>
      </div>

      <DocRow label="Supporting Documents" done={draft.supportingDocumentsUploaded} onUpload={() => update({ supportingDocumentsUploaded: true })} />

      <div
        style={{
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.textSecondary,
        }}
      >
        You may continue in Draft mode while documents are pending, if permitted by Admin policy.
      </div>
    </div>
  );
}

function DocRow({ label, done, onUpload }: { label: string; done: boolean; onUpload: () => void }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{label}</span>
      {done ? <Badge label="✓ Uploaded" tone="success" /> : <Button label="Upload" size="sm" variant="outline" onClick={onUpload} />}
    </div>
  );
}
