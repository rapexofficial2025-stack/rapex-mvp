import { Badge, Button, Input, useTheme } from "@rapex/ui-web";
import type { WizardDraft } from "./OnboardingWizard";

type StepKycProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

const VERIFICATION_STAGES = ["Pending", "Submitted", "Under Review", "Approved"] as const;

export function StepKyc({ draft, update }: StepKycProps) {
  const theme = useTheme();
  const allVerified = draft.govIdUploaded && draft.selfieUploaded && draft.mobileOtpVerified && draft.emailVerified;
  const stageIndex = allVerified ? 1 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        Before any store can be created, let's confirm who you are. This keeps RAPEX safe for every buyer and rider.
      </span>

      <div style={{ display: "flex", gap: 8 }}>
        {VERIFICATION_STAGES.map((stage, i) => (
          <Badge key={stage} label={stage} tone={i === stageIndex ? "brand" : i < stageIndex ? "success" : "neutral"} />
        ))}
      </div>

      <Input label="Full Name" value={draft.fullName} onChange={(e) => update({ fullName: e.target.value })} />
      <div style={{ display: "flex", gap: 8 }}>
        <Input label="Birthday" type="date" value={draft.birthday} onChange={(e) => update({ birthday: e.target.value })} />
        <Input label="Mobile Number" value={draft.mobileNumber} onChange={(e) => update({ mobileNumber: e.target.value })} placeholder="+63 9XX XXX XXXX" />
      </div>
      <Input label="Email Address" type="email" value={draft.email} onChange={(e) => update({ email: e.target.value })} />
      <Input label="Residential Address" value={draft.residentialAddress} onChange={(e) => update({ residentialAddress: e.target.value })} />

      <div
        style={{
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>Verification</span>
        <VerificationRow
          label="Government ID Upload"
          done={draft.govIdUploaded}
          onSimulate={() => update({ govIdUploaded: true })}
        />
        <VerificationRow
          label="Selfie holding Government ID"
          done={draft.selfieUploaded}
          onSimulate={() => update({ selfieUploaded: true })}
        />
        <VerificationRow
          label="Mobile OTP Verification"
          done={draft.mobileOtpVerified}
          onSimulate={() => update({ mobileOtpVerified: true })}
          actionLabel="Verify"
        />
        <VerificationRow
          label="Email Verification"
          done={draft.emailVerified}
          onSimulate={() => update({ emailVerified: true })}
          actionLabel="Verify"
        />
      </div>
    </div>
  );
}

function VerificationRow({
  label,
  done,
  onSimulate,
  actionLabel = "Upload",
}: {
  label: string;
  done: boolean;
  onSimulate: () => void;
  actionLabel?: string;
}) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{label}</span>
      {done ? <Badge label="✓ Done" tone="success" /> : <Button label={actionLabel} size="sm" variant="outline" onClick={onSimulate} />}
    </div>
  );
}
