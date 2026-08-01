import { Badge, GlassCard, useTheme } from "@rapex/ui-web";
import type { MerchantAccount } from "@rapex/api-client";

type MerchantVerificationProps = {
  account: MerchantAccount;
};

const STATUS_COPY: Record<MerchantAccount["verificationStatus"], { label: string; tone: "success" | "warning" | "error"; description: string }> = {
  verified: { label: "Verified", tone: "success", description: "Your merchant account is fully verified." },
  pending: { label: "Pending Review", tone: "warning", description: "Your documents are under review by RAPEX Admin." },
  unverified: { label: "Unverified", tone: "error", description: "Submit your business documents to get verified." },
};

export function MerchantVerification({ account }: MerchantVerificationProps) {
  const theme = useTheme();
  const copy = STATUS_COPY[account.verificationStatus];

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md }}>
        <div>
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Merchant Verification</div>
          <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: 600, color: theme.colors.textPrimary }}>
            {account.ownerName}
          </div>
          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{copy.description}</div>
        </div>
        <Badge label={copy.label} tone={copy.tone} />
      </div>
    </GlassCard>
  );
}
