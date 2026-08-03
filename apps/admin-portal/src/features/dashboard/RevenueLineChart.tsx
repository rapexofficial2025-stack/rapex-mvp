import { useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";

type Point = { date: string; revenue: number };

export function RevenueLineChart({ points }: { points: Point[] }) {
  const theme = useTheme();
  const width = 560;
  const height = 200;
  const padding = 24;

  const values = points.map((p) => p.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const stepX = (width - padding * 2) / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((p.revenue - min) / range) * (height - padding * 2);
    return { x, y, point: p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1]!.x} ${height - padding} L ${coords[0]!.x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Revenue trend">
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.colors.brandPrimary} stopOpacity={0.35} />
          <stop offset="100%" stopColor={theme.colors.brandPrimary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#revenueFill)" />
      <path d={linePath} fill="none" stroke={theme.colors.brandPrimary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={3.5} fill={theme.colors.brandPrimary} />
          <title>{`${new Date(c.point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${formatPeso(c.point.revenue)}`}</title>
        </g>
      ))}
    </svg>
  );
}
