import { useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { RevenueBreakdownSlice } from "@rapex/api-client";

const LABELS: Record<RevenueBreakdownSlice["label"], string> = {
  merchants: "Merchants",
  riders: "Riders",
  "platform-fee": "Platform Fee",
};

export function RevenueDonut({ slices }: { slices: RevenueBreakdownSlice[] }) {
  const theme = useTheme();
  const total = slices.reduce((sum, s) => sum + s.amount, 0) || 1;
  const colors = [theme.colors.brandPrimary, theme.colors.accent, theme.colors.brandSecondary];

  const size = 140;
  const radius = 56;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let offsetAccum = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.lg }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Revenue breakdown">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {slices.map((slice, i) => {
            const fraction = slice.amount / total;
            const dash = fraction * circumference;
            const el = (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offsetAccum}
              />
            );
            offsetAccum += dash;
            return el;
          })}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill={theme.colors.textPrimary}
          fontFamily="inherit"
        >
          {formatPeso(total)}
        </text>
        <text x="50%" y="60%" textAnchor="middle" fontSize={9} fill={theme.colors.textSecondary} fontFamily="inherit">
          Total Revenue
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
        {slices.map((slice, i) => (
          <div key={slice.label} style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors[i % colors.length] }} />
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
              {LABELS[slice.label]}
            </span>
            <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              {formatPeso(slice.amount)} ({((slice.amount / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
