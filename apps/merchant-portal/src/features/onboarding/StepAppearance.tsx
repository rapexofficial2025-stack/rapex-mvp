import { Badge, Button, GlassCard, useTheme } from "@rapex/ui-web";
import type { WizardDraft } from "./OnboardingWizard";

type StepAppearanceProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

export function StepAppearance({ draft, update }: StepAppearanceProps) {
  const theme = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <UploadRow label="Logo" done={draft.logoUploaded} onUpload={() => update({ logoUploaded: true })} />
      <UploadRow label="Cover Photo" done={draft.coverPhotoUploaded} onUpload={() => update({ coverPhotoUploaded: true })} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
          Gallery Images ({draft.galleryImageCount})
        </span>
        <Button label="+ Add Image" size="sm" variant="outline" onClick={() => update({ galleryImageCount: draft.galleryImageCount + 1 })} />
      </div>

      <div>
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>Preview Store</span>
        <GlassCard style={{ marginTop: theme.spacing.sm }}>
          <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
            <div style={{ fontSize: 40 }}>{draft.logoUploaded ? "🏪" : "❔"}</div>
            <div>
              <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
                {draft.storeName || "Your Store Name"}
              </div>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                {draft.storeDescription || "Your store description will appear here."}
              </div>
              <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                {draft.coverPhotoUploaded ? <Badge label="Cover Ready" tone="success" /> : null}
                {draft.galleryImageCount > 0 ? <Badge label={`${draft.galleryImageCount} Gallery Photos`} tone="info" /> : null}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function UploadRow({ label, done, onUpload }: { label: string; done: boolean; onUpload: () => void }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{label}</span>
      {done ? <Badge label="✓ Uploaded" tone="success" /> : <Button label="Upload" size="sm" variant="outline" onClick={onUpload} />}
    </div>
  );
}
