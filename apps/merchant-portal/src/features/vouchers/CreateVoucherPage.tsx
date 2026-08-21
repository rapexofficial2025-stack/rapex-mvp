import { useState, type CSSProperties } from "react";
import { Badge, Button, EmptyState, ErrorState, Input, Loading, useTheme } from "@rapex/ui-web";
import { useAsync, useAsyncAction, useRepositories, type VoucherDiscountType } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import { useMerchantStoreWorkspace } from "../workspace/useMerchantStoreWorkspace";

const DISCOUNT_TYPES: { key: VoucherDiscountType; label: string }[] = [
  { key: "percent", label: "% Off" },
  { key: "fixed", label: "₱ Off" },
  { key: "free_delivery", label: "Free Delivery" },
];

/**
 * GCash-simple, one screen: create a store voucher, see the ones you've
 * made. Per founder instruction (2026-08-20): "merchant can place voucher
 * and rules." Matches the Coupon engine already documented in
 * docs/business/Commissions.md's Formula Engine section -- this is a
 * store-scoped instance of that same concept, not a separate system.
 *
 * No confirmed Xano voucher endpoint exists yet, so this is Mock-backed
 * (see MockMerchantRepository.createVoucher/getMyVouchers) -- real,
 * working, in-memory for this session, not yet a live Xano write. It is
 * NOT yet wired to customer-app's checkout redemption (a separate app,
 * no shared backend for this feature until Xano exists).
 */
export function CreateVoucherPage() {
  const theme = useTheme();
  const { merchant } = useRepositories();
  const { currentStore, currentStoreId } = useMerchantStoreWorkspace();

  const { data: vouchers, loading: vouchersLoading, error: vouchersError, refetch } = useAsync(
    () => (currentStoreId ? merchant!.getMyVouchers(currentStoreId) : Promise.resolve([])),
    [currentStoreId],
  );

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<VoucherDiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const createVoucher = useAsyncAction(
    (input: { code: string; discountType: VoucherDiscountType; discountValue: number; minOrderAmount: number; usageLimit: number | null; expiresAt: string | null }) =>
      merchant!.createVoucher(currentStoreId!, input),
  );
  const deactivateVoucher = useAsyncAction((voucherId: string) => merchant!.deactivateVoucher(voucherId));

  if (!currentStoreId) {
    return (
      <div style={styles.page}>
        <EmptyState title="No store yet" description="Register your store before creating vouchers." />
      </div>
    );
  }

  const needsDiscountValue = discountType !== "free_delivery";

  return (
    <div style={styles.page}>
      <h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>Create Voucher</h1>
      <p style={{ color: theme.colors.textSecondary, margin: 0 }}>For {currentStore?.name ?? "your store"}</p>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <Input label="Voucher Code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="e.g. WELCOME50" />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textPrimary }}>Discount Type</span>
          <div style={{ display: "flex", gap: 8 }}>
            {DISCOUNT_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setDiscountType(type.key)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${discountType === type.key ? theme.colors.brandPrimary : theme.colors.border}`,
                  background: discountType === type.key ? theme.colors.brandPrimary : "transparent",
                  color: discountType === type.key ? theme.colors.textInverse : theme.colors.textPrimary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {needsDiscountValue ? (
          <Input
            label={discountType === "percent" ? "Discount (%)" : "Discount (₱)"}
            type="number"
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 50"}
          />
        ) : null}

        <Input label="Minimum Order (₱)" type="number" value={minOrderAmount} onChange={(event) => setMinOrderAmount(event.target.value)} placeholder="e.g. 150" />
        <Input label="Usage Limit (blank = unlimited)" type="number" value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} placeholder="e.g. 100" />
        <Input label="Expiry Date (blank = never)" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />

        {createVoucher.error ? <ErrorState description={createVoucher.error} /> : null}

        <Button
          label={createVoucher.loading ? "Creating…" : "Create Voucher"}
          loading={createVoucher.loading}
          disabled={!code || (needsDiscountValue && !discountValue)}
          onClick={async () => {
            const created = await createVoucher.execute({
              code,
              discountType,
              discountValue: needsDiscountValue ? Number(discountValue) : 0,
              minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
              usageLimit: usageLimit ? Number(usageLimit) : null,
              expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            });
            setJustCreated(created.code);
            setCode("");
            setDiscountValue("");
            setMinOrderAmount("");
            setUsageLimit("");
            setExpiresAt("");
            refetch();
          }}
        />
        {justCreated ? <Badge label={`${justCreated} created ✓`} tone="success" /> : null}
      </div>

      <h2 style={{ ...styles.sectionTitle, color: theme.colors.textPrimary }}>My Vouchers</h2>
      {vouchersLoading ? (
        <Loading />
      ) : vouchersError ? (
        <ErrorState description={vouchersError} onRetry={refetch} />
      ) : !vouchers || vouchers.length === 0 ? (
        <EmptyState title="No vouchers yet" description="Vouchers you create will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vouchers.map((voucher) => (
            <div key={voucher.id} style={{ ...styles.voucherRow, borderColor: theme.colors.border, background: theme.colors.surface }}>
              <div>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>{voucher.code}</span>
                <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  {voucher.discountType === "free_delivery"
                    ? "Free delivery"
                    : voucher.discountType === "percent"
                      ? `${voucher.discountValue}% off`
                      : `${formatPeso(voucher.discountValue)} off`}
                  {voucher.minOrderAmount > 0 ? ` · Min. ${formatPeso(voucher.minOrderAmount)}` : ""}
                  {voucher.usageLimit ? ` · ${voucher.usedCount}/${voucher.usageLimit} used` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge label={voucher.active ? "Active" : "Inactive"} tone={voucher.active ? "success" : "neutral"} />
                {voucher.active ? (
                  <Button
                    label="Deactivate"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await deactivateVoucher.execute(voucher.id);
                      refetch();
                    }}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 480, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  card: { border: "1px solid", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, margin: "8px 0 0" },
  voucherRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: "1px solid" },
};
