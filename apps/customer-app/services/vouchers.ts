/**
 * Illustrative mock voucher catalog -- matches the "Coupon engine"
 * concept already documented in docs/business/Commissions.md's Formula
 * Engine section, but no confirmed Xano voucher table/endpoint exists
 * yet, so this stays local/mock (real, working flow; not real money).
 */
export type VoucherResult = {
  code: string;
  description: string;
  discountAmount: number;
  freeDelivery: boolean;
};

type VoucherDefinition = { description: string; discountAmount: number; freeDelivery: boolean; minSubtotal: number };

const MOCK_VOUCHERS: Record<string, VoucherDefinition> = {
  WELCOME50: { description: "₱50 off your order", discountAmount: 50, freeDelivery: false, minSubtotal: 150 },
  FREESHIP: { description: "Free delivery", discountAmount: 0, freeDelivery: true, minSubtotal: 100 },
};

export function validateVoucher(code: string, subtotal: number): { ok: true; result: VoucherResult } | { ok: false; error: string } {
  const key = code.trim().toUpperCase();
  const entry = MOCK_VOUCHERS[key];
  if (!entry) return { ok: false, error: "Voucher code not found." };
  if (subtotal < entry.minSubtotal) return { ok: false, error: `This voucher needs a minimum order of ₱${entry.minSubtotal}.` };
  return { ok: true, result: { code: key, description: entry.description, discountAmount: entry.discountAmount, freeDelivery: entry.freeDelivery } };
}

export const FIRST_ORDER_FREE_DELIVERY_MIN_SUBTOTAL = 150;
