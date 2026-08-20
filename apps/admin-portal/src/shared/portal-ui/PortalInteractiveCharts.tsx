import { useId, useState } from "react";

export type PortalChartPoint = {
  label: string;
  value: number;
};

export type PortalDonutSlice = {
  label: string;
  value: number;
  tone: "lavender" | "yellow" | "mint";
};

const TONE_COLOR: Record<PortalDonutSlice["tone"], string> = {
  lavender: "var(--portal-lavender)",
  yellow: "var(--portal-yellow)",
  mint: "var(--portal-mint)",
};

export function PortalInteractiveLineChart({
  points,
  formatValue,
  ariaLabel,
}: {
  points: PortalChartPoint[];
  formatValue: (value: number) => string;
  ariaLabel: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;
  const gradientId = `rapex-line-${useId().replace(/:/g, "")}`;
  const width = 620;
  const height = 224;
  const paddingX = 30;
  const paddingTop = 20;
  const paddingBottom = 38;
  const values = points.map((point) => point.value);
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values, 0);
  const range = maximum - minimum || 1;
  const stepX = (width - paddingX * 2) / Math.max(1, points.length - 1);
  const baseline = height - paddingBottom;
  const coordinates = points.map((point, index) => ({
    point,
    x: paddingX + index * stepX,
    y: baseline - ((point.value - minimum) / range) * (baseline - paddingTop),
  }));
  const linePath = coordinates.map((coordinate, index) => `${index === 0 ? "M" : "L"} ${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`).join(" ");
  const areaPath = coordinates.length > 0 ? `${linePath} L ${coordinates[coordinates.length - 1]!.x.toFixed(2)} ${baseline} L ${coordinates[0]!.x.toFixed(2)} ${baseline} Z` : "";
  const active = activeIndex === null ? null : coordinates[activeIndex];

  if (points.length === 0) return <div className="rapex-chart-empty">No chart data available.</div>;

  return (
    <div className="rapex-interactive-line-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--portal-lavender)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--portal-lavender)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((position) => {
          const y = paddingTop + (baseline - paddingTop) * position;
          return <line key={position} className="rapex-line-chart__grid" x1={paddingX} x2={width - paddingX} y1={y} y2={y} />;
        })}

        <path className="rapex-line-chart__area" d={areaPath} fill={`url(#${gradientId})`} />
        <path className="rapex-line-chart__path" d={linePath} pathLength={1} />

        {active ? <line className="rapex-line-chart__guide" x1={active.x} x2={active.x} y1={paddingTop} y2={baseline} /> : null}

        {coordinates.map((coordinate, index) => (
          <g key={coordinate.point.label}>
            <circle
              className="rapex-line-chart__hit-area"
              cx={coordinate.x}
              cy={coordinate.y}
              r={14}
              role="button"
              tabIndex={0}
              aria-label={`${coordinate.point.label}: ${formatValue(coordinate.point.value)}`}
              aria-pressed={selectedIndex === index}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex((current) => (current === index ? null : index))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedIndex((current) => (current === index ? null : index));
                }
              }}
            />
            <circle
              className={activeIndex === index ? "rapex-line-chart__point is-active" : "rapex-line-chart__point"}
              cx={coordinate.x}
              cy={coordinate.y}
              r={4}
            />
            <text className="rapex-line-chart__axis-label" x={coordinate.x} y={height - 14} textAnchor="middle">
              {coordinate.point.label}
            </text>
          </g>
        ))}

        {active ? (
          <g className="rapex-line-chart__tooltip" transform={`translate(${Math.min(Math.max(active.x - 58, 8), width - 124)} ${Math.max(active.y - 54, 8)})`}>
            <rect width={116} height={40} rx={10} />
            <text x={58} y={17} textAnchor="middle">{active.point.label}</text>
            <text className="is-value" x={58} y={32} textAnchor="middle">{formatValue(active.point.value)}</text>
          </g>
        ) : null}
      </svg>
      <p className="rapex-chart-hint">Point to or focus a data point to inspect its value.</p>
    </div>
  );
}

export function PortalInteractiveDonutChart({
  slices,
  totalLabel,
  formatValue,
  ariaLabel,
}: {
  slices: PortalDonutSlice[];
  totalLabel: string;
  formatValue: (value: number) => string;
  ariaLabel: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const size = 160;
  const radius = 61;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const activeSlice = activeIndex === null ? null : slices[activeIndex];
  let offset = 0;

  return (
    <div className="rapex-interactive-donut" onPointerLeave={() => setHoveredIndex(null)}>
      <div className="rapex-interactive-donut__graphic">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
          <circle className="rapex-donut__track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} />
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {slices.map((slice, index) => {
              const dash = (slice.value / total) * circumference;
              const currentOffset = offset;
              offset += dash;
              return (
                <circle
                  key={slice.label}
                  className={activeIndex === index ? "rapex-donut__segment is-active" : "rapex-donut__segment"}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={TONE_COLOR[slice.tone]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-currentOffset}
                  pathLength={circumference}
                  aria-label={`${slice.label}: ${formatValue(slice.value)}`}
                  onPointerEnter={() => setHoveredIndex(index)}
                />
              );
            })}
          </g>
          <text className="rapex-donut__center-value" x="50%" y="48%" textAnchor="middle">
            {formatValue(activeSlice?.value ?? total)}
          </text>
          <text className="rapex-donut__center-label" x="50%" y="61%" textAnchor="middle">
            {activeSlice?.label ?? totalLabel}
          </text>
        </svg>
      </div>

      <div className="rapex-donut__legend" aria-label={`${ariaLabel} legend`}>
        {slices.map((slice, index) => (
          <button
            key={slice.label}
            type="button"
            className={activeIndex === index ? "rapex-donut__legend-item is-active" : "rapex-donut__legend-item"}
            aria-pressed={selectedIndex === index}
            onPointerEnter={() => setHoveredIndex(index)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex((current) => (current === index ? null : index))}
          >
            <span className="rapex-donut__legend-dot" style={{ backgroundColor: TONE_COLOR[slice.tone] }} />
            <span>{slice.label}</span>
            <strong>{formatValue(slice.value)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
