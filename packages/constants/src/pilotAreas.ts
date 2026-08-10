export const PILOT_AREAS = ["Imus", "Kawit", "Lancaster", "General Trias"] as const;

export type PilotArea = (typeof PILOT_AREAS)[number];
