import type { Role } from "@rapex/constants";

export function hasRole(userRole: Role, required: Role): boolean {
  return userRole === required;
}

export function hasAnyRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

/**
 * Generic role-gate check. The actual permission matrix (who can do what) is a
 * business rule -- see docs/business/Admin.md and docs/business/User.md once
 * defined -- this just provides the mechanism apps call once that matrix exists.
 */
export function canAccess(userRole: Role, allowedRoles: readonly Role[]): boolean {
  return hasAnyRole(userRole, allowedRoles);
}
