import type { Theme } from "@rapex/theme";

export type RoleKey = "rider" | "customer" | "merchant";

export type RoleConfig = {
  key: RoleKey;
  label: string;
  tagline: string;
  emoji: string;
  categoryHint: string;
};

export const ROLE_ORDER: RoleKey[] = ["rider", "customer", "merchant"];

export const ROLES: Record<RoleKey, RoleConfig> = {
  rider: {
    key: "rider",
    label: "Rider",
    tagline: "Deliveries and on-demand trips",
    emoji: "🏍️",
    categoryHint: "e.g. Motorbike Delivery, Courier, Padala",
  },
  customer: {
    key: "customer",
    label: "Customer",
    tagline: "Shop, order, and book services",
    emoji: "🛍️",
    categoryHint: "e.g. Home Cleaning, Tutoring, Repair",
  },
  merchant: {
    key: "merchant",
    label: "Merchant",
    tagline: "Sell products and manage a store",
    emoji: "🏪",
    categoryHint: "e.g. Grocery Store, Bakery, Sari-Sari",
  },
};

export function isRoleKey(value: string | undefined): value is RoleKey {
  return value === "rider" || value === "customer" || value === "merchant";
}

export function roleAccent(theme: Theme, role: RoleKey): string {
  switch (role) {
    case "rider":
      return theme.colors.brandSecondary;
    case "customer":
      return theme.colors.brandPrimary;
    case "merchant":
      return theme.colors.accent;
  }
}
