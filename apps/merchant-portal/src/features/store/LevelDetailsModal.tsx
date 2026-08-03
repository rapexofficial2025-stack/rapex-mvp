import { Modal, useTheme } from "@rapex/ui-web";
import type { MerchantAccount } from "@rapex/api-client";

type LevelDetailsModalProps = {
  unlockLevel: number;
  account: MerchantAccount;
  onClose: () => void;
};

const REWARDS = [
  "Unlock another Branch",
  "Additional Analytics",
  "Higher Visibility",
  "Merchant Badge",
  "Priority Support",
  "Branch Expansion",
];

export function LevelDetailsModal({ unlockLevel, account, onClose }: LevelDetailsModalProps) {
  const theme = useTheme();
  const percent = Math.min(100, Math.round((account.xp / account.xpForNextLevel) * 100));

  return (
    <Modal title={`LEVEL ${unlockLevel}`} onClose={onClose}>
      <div>
        <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textPrimary }}>Rewards</span>
        <div style={{ marginTop: theme.spacing.xs, display: "flex", flexDirection: "column", gap: 4 }}>
          {REWARDS.map((reward) => (
            <span key={reward} style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
              🏅 {reward}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: theme.spacing.sm }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
          <span>Current: Level {account.level}</span>
          <span>{percent}%</span>
        </div>
        <div style={{ marginTop: 4, height: 8, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceAlt, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", backgroundColor: theme.colors.brandPrimary }} />
        </div>
      </div>
    </Modal>
  );
}
