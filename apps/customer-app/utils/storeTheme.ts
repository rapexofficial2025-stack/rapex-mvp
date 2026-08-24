/**
 * Category-tinted accent color per founder reference (2026-08-20 "cover
 * shape customization" sheet) -- real merchant-chosen themes need a
 * category/theme/cover-shape/accent-color config on the merchant side
 * (see docs task for the Store detail screen), not built yet. Until then
 * this derives a reasonable accent from the store's existing `category`
 * string so cards/headers aren't all one flat brand-purple block.
 */
const CATEGORY_THEME: Record<string, { accent: string; accentSoft: string }> = {
  food: { accent: "#F97316", accentSoft: "#FFF1E6" },
  restaurants: { accent: "#F97316", accentSoft: "#FFF1E6" },
  marketplace: { accent: "#8B5CF6", accentSoft: "#F1EBFE" },
  hardware: { accent: "#EA580C", accentSoft: "#FFEFE3" },
  industrial: { accent: "#1E3A8A", accentSoft: "#E7ECFA" },
  services: { accent: "#2563EB", accentSoft: "#E6EEFD" },
  auction: { accent: "#7C3AED", accentSoft: "#F0E9FE" },
  provider: { accent: "#0D9488", accentSoft: "#E1F5F2" },
  grocery: { accent: "#16A34A", accentSoft: "#E9F8EE" },
  health: { accent: "#0284C7", accentSoft: "#E4F3FB" },
  pharmacy: { accent: "#0284C7", accentSoft: "#E4F3FB" },
  pets: { accent: "#0D9488", accentSoft: "#E1F5F2" },
};

const DEFAULT_THEME = { accent: "#8B5CF6", accentSoft: "#F1EBFE" };

export function getStoreTheme(category: string): { accent: string; accentSoft: string } {
  const key = category.trim().toLowerCase();
  return CATEGORY_THEME[key] ?? DEFAULT_THEME;
}
