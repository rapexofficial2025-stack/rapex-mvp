import { useState } from "react";
import { Badge, Button, Input, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";
import type { MerchantProduct, MerchantStore } from "@rapex/api-client";
import { getStoreStats } from "./headquartersMockStats";
import { PlaceholderActionModal } from "./PlaceholderActionModal";

type StoreHeroCardProps = {
  store: MerchantStore;
  products: MerchantProduct[];
  storeMode: boolean;
  toggling: boolean;
  onToggleStoreMode: () => void;
};

export function StoreHeroCard({ store, products, storeMode, toggling, onToggleStoreMode }: StoreHeroCardProps) {
  const theme = useTheme();
  const stats = getStoreStats(store.id);
  const [placeholderAction, setPlaceholderAction] = useState<null | { title: string; description: string }>(null);
  const [showBoostPanel, setShowBoostPanel] = useState(false);
  const [boostHeadline, setBoostHeadline] = useState("");
  const [boostProductId, setBoostProductId] = useState(products[0]?.id ?? "");
  const [boosted, setBoosted] = useState(false);

  return (
    <div
      style={{
        borderRadius: theme.radius["2xl"],
        overflow: "hidden",
        background: `linear-gradient(135deg, ${theme.colors.brandPrimary}, ${theme.colors.brandPrimaryHover})`,
        boxShadow: theme.shadows.lg.css,
        color: theme.colors.textInverse,
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing.lg,
        padding: theme.spacing.xl,
      }}
    >
      <div style={{ flex: 2, minWidth: 320, display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
        <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "flex-start" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius.xl,
              backgroundColor: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              flexShrink: 0,
            }}
          >
            {store.logoLabel}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs, flexWrap: "wrap" }}>
              <Badge label="MAIN STORE" tone="accent" />
              <Badge label={storeMode ? "● Online" : "● Offline"} tone={storeMode ? "success" : "neutral"} />
            </div>
            <h2 style={{ margin: 0, fontSize: theme.typography.fontSize["2xl"], display: "flex", alignItems: "center", gap: 6 }}>
              {store.name} <span title="Verified">✅</span>
            </h2>
            <span style={{ fontSize: theme.typography.fontSize.sm, opacity: 0.9 }}>
              {store.category} · {store.address}
            </span>
            <span style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.8 }}>
              ⭐ {store.rating} ({stats.savedByCustomers} Reviews) · Member since Jan 2026
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.lg }}>
          <HeroStat icon="📦" value={String(store.productCount)} label="Total Products" />
          <HeroStat icon="👥" value={stats.followers.toLocaleString()} label="Followers" />
          <HeroStat icon="📄" value={formatPeso(stats.revenueToday)} label="Revenue (Today)" />
          <HeroStat icon="⭐" value={String(store.rating)} label="Store Rating" />
          <HeroStat icon="🔥" value={stats.totalSold.toLocaleString()} label="Total Sold" />
          <HeroStat icon="🥇" value="Gold" label="Reward Level" />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.md }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: theme.radius.lg,
              padding: theme.spacing.md,
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.85 }}>Store Health</div>
            <div style={{ fontSize: theme.typography.fontSize.xl, fontWeight: 700 }}>95%</div>
            <div style={{ fontSize: theme.typography.fontSize.sm }}>★★★★★ Excellent</div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: theme.radius.lg,
              padding: theme.spacing.md,
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.85 }}>Store Status</div>
            <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: 700 }}>🟢 {storeMode ? "Open" : "Closed"}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs }}>{storeMode ? "Receiving Orders" : "Not receiving orders"}</div>
            <div style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.85 }}>Business Hours: {store.businessHours}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm }}>
          <Button label={toggling ? "…" : storeMode ? "Set Offline" : "Set Online"} variant="secondary" loading={toggling} onClick={onToggleStoreMode} />
          <Button
            label="Manage Store"
            onClick={() => setPlaceholderAction({ title: "Manage Store", description: "Full store management console coming soon." })}
          />
          <Button
            label="Customer View"
            variant="outline"
            onClick={() => setPlaceholderAction({ title: "Customer View", description: "Preview exactly what customers see on your storefront." })}
          />
          <Button
            label="Edit Store"
            variant="outline"
            onClick={() => setPlaceholderAction({ title: "Edit Store", description: "Edit your store profile, logo, cover photo, and details." })}
          />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 260 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentHover})`,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: theme.typography.fontSize.lg }}>
            🚀 Boost Store
          </div>
          <span style={{ fontSize: theme.typography.fontSize.sm, opacity: 0.95 }}>
            Get more visibility and reach more buyers near you.
          </span>
          <div style={{ display: "flex", gap: theme.spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
            <Badge label={boosted ? "0 Free Boosts" : "1 Free Boost"} tone="neutral" />
            <span style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.9 }}>Resets in 6d 12h 30m</span>
          </div>

          {showBoostPanel ? (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
              <Input label="Promotion Headline" value={boostHeadline} onChange={(e) => setBoostHeadline(e.target.value)} placeholder="e.g. 10% off today only" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: theme.typography.fontSize.sm }}>Featured Product</label>
                <select
                  value={boostProductId}
                  onChange={(e) => setBoostProductId(e.target.value)}
                  style={{ padding: theme.spacing.sm, borderRadius: theme.radius.md, border: "none" }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <Button
            label={boosted ? "Boosted ✓" : "Boost Now"}
            variant="secondary"
            disabled={boosted}
            onClick={() => {
              setShowBoostPanel(true);
              if (showBoostPanel) setBoosted(true);
            }}
          />
        </div>
      </div>

      {placeholderAction ? (
        <PlaceholderActionModal
          title={placeholderAction.title}
          description={placeholderAction.description}
          onClose={() => setPlaceholderAction(null)}
        />
      ) : null}
    </div>
  );
}

function HeroStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.xs }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: theme.typography.fontSize.base, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.85 }}>{label}</div>
      </div>
    </div>
  );
}
