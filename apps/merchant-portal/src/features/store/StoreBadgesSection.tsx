import { useTheme } from "@rapex/ui-web";
import type { MerchantAccount } from "@rapex/api-client";
import { HqSectionCard } from "./HqSectionCard";

type StoreBadgesSectionProps = {
  account: MerchantAccount;
};

export function StoreBadgesSection({ account }: StoreBadgesSectionProps) {
  const theme = useTheme();

  const badges = [
    { icon: "🛡", label: "Verified Merchant" },
    { icon: "🏆", label: "Top Seller" },
    { icon: "⚡", label: "Fast Response" },
    { icon: "⭐", label: "Highly Rated" },
    { icon: "🥇", label: `Level ${account.level}` },
  ];

  return (
    <HqSectionCard emoji="🏅" title="Store Badges" color="gold">
      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.md }}>
        {badges.map((badge) => (
          <div
            key={badge.label}
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.full,
              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
          >
            <span style={{ fontSize: 16 }}>{badge.icon}</span>
            <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>{badge.label}</span>
          </div>
        ))}
      </div>
    </HqSectionCard>
  );
}
