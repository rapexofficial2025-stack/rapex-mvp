import { useTheme } from "@rapex/ui-web";
import { BUSINESS_NATURE_OPTIONS } from "./businessOptions";
import type { WizardDraft } from "./OnboardingWizard";

type StepBusinessNatureProps = {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
};

export function StepBusinessNature({ draft, update }: StepBusinessNatureProps) {
  const theme = useTheme();
  const options = draft.businessCategory ? BUSINESS_NATURE_OPTIONS[draft.businessCategory] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
        Pick the option that best describes your business.
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm }}>
        {options.map((nature) => {
          const active = draft.businessNature === nature;
          return (
            <button
              key={nature}
              type="button"
              onClick={() => update({ businessNature: nature })}
              style={{
                border: `1px solid ${active ? theme.colors.brandPrimary : theme.colors.border}`,
                borderRadius: theme.radius.full,
                padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                backgroundColor: active ? theme.colors.brandPrimary : theme.colors.surface,
                color: active ? theme.colors.textInverse : theme.colors.textPrimary,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {nature}
            </button>
          );
        })}
      </div>
    </div>
  );
}
