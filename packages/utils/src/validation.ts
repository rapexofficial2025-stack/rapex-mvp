const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts PH mobile numbers as 09XXXXXXXXX or +639XXXXXXXXX.
const PH_MOBILE_PATTERN = /^(?:\+63|0)9\d{9}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhMobile(value: string): boolean {
  return PH_MOBILE_PATTERN.test(value.trim());
}

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const varietyScore = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (password.length < 8 || varietyScore <= 1) return "weak";
  if (password.length >= 12 && varietyScore >= 3) return "strong";
  return "medium";
}

export function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
