import { useEffect, useState } from "react";
import { Button, Loading, useTheme } from "@rapex/ui-web";
import {
  useRegistrationDraft,
  useSaveRegistrationDraftAction,
  useSubmitRegistrationAction,
  type MerchantRegistrationDraft,
} from "@rapex/api-client";
import { ONBOARDING_STEP_TITLES } from "./businessOptions";
import { StepKyc } from "./StepKyc";
import { StepBusinessCategory } from "./StepBusinessCategory";
import { StepBusinessNature } from "./StepBusinessNature";
import { StepStoreDetails } from "./StepStoreDetails";
import { StepDocuments } from "./StepDocuments";
import { StepAppearance } from "./StepAppearance";
import { StepProducts } from "./StepProducts";
import { OnboardingCelebration } from "./OnboardingCelebration";

export type WizardDraft = Omit<MerchantRegistrationDraft, "merchantAccountId" | "onboardingStatus">;

type OnboardingWizardProps = {
  onClose: () => void;
  onCompleted: () => void;
};

function isStepValid(step: number, draft: WizardDraft): boolean {
  switch (step) {
    case 1:
      return !!(draft.fullName && draft.birthday && draft.mobileNumber && draft.email && draft.residentialAddress);
    case 2:
      return !!draft.businessCategory;
    case 3:
      return !!draft.businessNature;
    case 4:
      return !!(draft.storeName && draft.storeAddress && draft.businessContactNumber);
    case 5:
      return !!draft.businessStructure;
    default:
      return true;
  }
}

export function OnboardingWizard({ onClose, onCompleted }: OnboardingWizardProps) {
  const theme = useTheme();
  const { data: serverDraft, loading } = useRegistrationDraft();
  const saveDraft = useSaveRegistrationDraftAction();
  const submitRegistration = useSubmitRegistrationAction();

  const [draft, setDraft] = useState<WizardDraft | null>(null);
  const [step, setStep] = useState(1);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (serverDraft && !draft) {
      const { merchantAccountId: _merchantAccountId, onboardingStatus: _onboardingStatus, ...rest } = serverDraft;
      setDraft(rest);
      setStep(serverDraft.currentStep || 1);
    }
  }, [serverDraft, draft]);

  if (loading || !draft) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: theme.colors.overlay, zIndex: 2000 }}>
        <Loading label="Preparing your business onboarding…" />
      </div>
    );
  }

  const update = (patch: Partial<WizardDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const goNext = async () => {
    const nextStep = Math.min(7, step + 1);
    await saveDraft.execute({ ...draft, currentStep: nextStep });
    setStep(nextStep);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    await saveDraft.execute({ ...draft, currentStep: 7 });
    await submitRegistration.execute();
    setCelebrating(true);
  };

  if (celebrating) {
    return (
      <OnboardingCelebration
        storeName={draft.storeName}
        onDone={() => {
          onCompleted();
          onClose();
        }}
      />
    );
  }

  const stepProps = { draft, update };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: theme.colors.overlay,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.lg,
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg.css,
          width: 720,
          maxWidth: "95vw",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                Step {step} of 7
              </span>
              <h2 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>
                {ONBOARDING_STEP_TITLES[step - 1]}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: theme.typography.fontSize.lg, color: theme.colors.textSecondary }}
            >
              ×
            </button>
          </div>
          <div style={{ marginTop: theme.spacing.sm, display: "flex", gap: 4 }}>
            {ONBOARDING_STEP_TITLES.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: theme.radius.full,
                  backgroundColor: i + 1 <= step ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: theme.spacing.lg, display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
          {step === 1 ? <StepKyc {...stepProps} /> : null}
          {step === 2 ? <StepBusinessCategory {...stepProps} /> : null}
          {step === 3 ? <StepBusinessNature {...stepProps} /> : null}
          {step === 4 ? <StepStoreDetails {...stepProps} /> : null}
          {step === 5 ? <StepDocuments {...stepProps} /> : null}
          {step === 6 ? <StepAppearance {...stepProps} /> : null}
          {step === 7 ? <StepProducts {...stepProps} /> : null}
        </div>

        <div style={{ padding: theme.spacing.lg, borderTop: `1px solid ${theme.colors.border}`, display: "flex", justifyContent: "space-between" }}>
          <Button label="Back" variant="secondary" disabled={step === 1} onClick={goBack} />
          {step < 7 ? (
            <Button label="Next" loading={saveDraft.loading} disabled={!isStepValid(step, draft)} onClick={goNext} />
          ) : (
            <Button label="Submit for Review" loading={saveDraft.loading || submitRegistration.loading} onClick={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
