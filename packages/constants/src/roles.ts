export const ROLES = ["customer", "rider", "merchant", "provider", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  rider: "Rider",
  merchant: "Merchant",
  provider: "Provider",
  admin: "Admin",
};
