export type HqColorKey = "purple" | "blue" | "cyan" | "green" | "orange" | "gold" | "indigo" | "emerald" | "slate" | "teal";

/** Premium pastel bases -- never fully saturated. Title bars use these at ~30% opacity, content areas at ~10%. */
export const HQ_COLOR_HEX: Record<HqColorKey, string> = {
  purple: "#8B5CF6",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  green: "#22C55E",
  orange: "#F97316",
  gold: "#D4A017",
  indigo: "#6366F1",
  emerald: "#10B981",
  slate: "#64748B",
  teal: "#14B8A6",
};

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hqTitleBg(color: HqColorKey): string {
  return hexToRgba(HQ_COLOR_HEX[color], 0.3);
}

export function hqContentBg(color: HqColorKey): string {
  return hexToRgba(HQ_COLOR_HEX[color], 0.1);
}
