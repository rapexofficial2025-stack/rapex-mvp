/** Formats a peso amount (in whole pesos, e.g. 149.5) as "₱149.50". */
export function formatPeso(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

/** Converts centavos (integer) to a peso amount for display/math. */
export function centavosToPesos(centavos: number): number {
  return centavos / 100;
}

/** Converts a peso amount to centavos (integer), rounding to avoid float drift. */
export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}
