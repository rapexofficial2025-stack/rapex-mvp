import { useMemo, useState } from "react";
import { GlassCard, Input, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { EngineTierRule } from "@rapex/api-client";

type EngineTestCalculatorProps = {
  tiers: EngineTierRule[];
};

export function EngineTestCalculator({ tiers }: EngineTestCalculatorProps) {
  const theme = useTheme();
  const [amountInput, setAmountInput] = useState("");
  const amount = Number(amountInput);

  const matchedTier = useMemo(() => {
    if (!Number.isFinite(amount) || amountInput === "") return null;
    return (
      tiers.find((t) => t.active && amount >= t.fromAmount && (t.toAmount === null || amount <= t.toAmount)) ?? null
    );
  }, [tiers, amount, amountInput]);

  const commissionAmount = matchedTier ? (amount * matchedTier.commissionRatePercent) / 100 : 0;
  const markupAmount = matchedTier ? (amount * matchedTier.markupRatePercent) / 100 : 0;
  const netAmount = amount - commissionAmount + markupAmount;

  return (
    <GlassCard>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>
        Test Calculator
      </h3>
      <Input
        label="Input Amount"
        type="number"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        placeholder="Enter an amount to test against the rules above"
      />

      {amountInput === "" ? null : !matchedTier ? (
        <div style={{ marginTop: theme.spacing.md, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          No active rule matches {formatPeso(amount)}.
        </div>
      ) : (
        <div
          style={{
            marginTop: theme.spacing.md,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: theme.spacing.md,
          }}
        >
          <OutputTile label="Matched Rule" value={matchedTier.label} theme={theme} />
          <OutputTile label="Commission" value={formatPeso(commissionAmount)} theme={theme} />
          <OutputTile label="Markup" value={formatPeso(markupAmount)} theme={theme} />
          <OutputTile label="Net Output Amount" value={formatPeso(netAmount)} theme={theme} highlight />
        </div>
      )}
    </GlassCard>
  );
}

function OutputTile({
  label,
  value,
  theme,
  highlight,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: highlight ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: theme.typography.fontSize.xs, color: highlight ? theme.colors.textInverse : theme.colors.textSecondary }}>
        {label}
      </span>
      <span
        style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: 700,
          color: highlight ? theme.colors.textInverse : theme.colors.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  );
}
