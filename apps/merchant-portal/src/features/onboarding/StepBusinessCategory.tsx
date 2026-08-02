import { useTheme } from "@rapex/ui-web";
import { BUSINESS_CATEGORIES } from "./businessOptions";
import type { WizardDraft } from "./OnboardingWizard";

type StepBusinessCategoryProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

export function StepBusinessCategory({ draft, update }: StepBusinessCategoryProps) {
  const theme = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        What kind of business are you building?
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: theme.spacing.md }}>
        {BUSINESS_CATEGORIES.map((category) => {
          const active = draft.businessCategory === category.key;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => update({ businessCategory: category.key, businessNature: null })}
              style={{
                textAlign: "left",
                border: `2px solid ${active ? theme.colors.brandPrimary : theme.colors.border}`,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                backgroundColor: active ? theme.colors.surfaceAlt : theme.colors.surface,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.sm,
              }}
            >
              <span style={{ fontSize: 40 }}>{category.icon}</span>
              <span style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
                {category.label}
              </span>
              <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{category.blurb}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
