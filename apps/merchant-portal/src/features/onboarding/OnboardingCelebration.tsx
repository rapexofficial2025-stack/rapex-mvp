import { Button, GlassCard, useTheme } from "@rapex/ui-web";

type OnboardingCelebrationProps = {
  storeName: string;
  onDone: () => void;
};

const HIGHLIGHTS = [
  "🏪 New Branch Slot Unlocked!",
  "📈 Better Store Visibility",
  "📊 More Analytics Available",
  "🚀 Higher Marketplace Exposure",
];

export function OnboardingCelebration({ storeName, onDone }: OnboardingCelebrationProps) {
  const theme = useTheme();

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
      <GlassCard style={{ width: 480, maxWidth: "95vw", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2 style={{ margin: `${theme.spacing.sm}px 0`, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>
          Congratulations!
        </h2>
        <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          {storeName || "Your business"} has expanded. Your business has been approved and added to your Merchant Headquarters, and you earned +150 XP.
        </p>
        <div style={{ marginTop: theme.spacing.md, display: "flex", flexDirection: "column", gap: theme.spacing.xs, textAlign: "left" }}>
          {HIGHLIGHTS.map((highlight) => (
            <span key={highlight} style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
              {highlight}
            </span>
          ))}
        </div>
        <div style={{ marginTop: theme.spacing.lg }}>
          <Button label="Go to My Store" onClick={onDone} />
        </div>
      </GlassCard>
    </div>
  );
}
