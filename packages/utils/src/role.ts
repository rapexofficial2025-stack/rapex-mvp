import { ROLE_LABELS, type Role } from "@rapex/constants";

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export function isCustomer(role: Role): boolean {
  return role === "customer";
}

export function isRider(role: Role): boolean {
  return role === "rider";
}

export function isMerchant(role: Role): boolean {
  return role === "merchant";
}

export function isProvider(role: Role): boolean {
  return role === "provider";
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}
