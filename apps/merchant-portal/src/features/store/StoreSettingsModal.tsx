import { useState } from "react";
import { Badge, Button, Input, Modal, useTheme } from "@rapex/ui-web";
import type { MerchantStore } from "@rapex/api-client";

type StoreSettingsModalProps = {
  store: MerchantStore;
  onClose: () => void;
};

/**
 * UI skeleton only. Claude will connect this form to the confirmed Merchant
 * store-update endpoint once its request/response contract is finalized.
 */
export function StoreSettingsModal({ store, onClose }: StoreSettingsModalProps) {
  const theme = useTheme();
  const [name, setName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [businessHours, setBusinessHours] = useState(store.businessHours);
  const [saveNotice, setSaveNotice] = useState(false);

  return (
    <Modal
      title="Manage store"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          <Button label="Close" variant="secondary" onClick={onClose} />
          <Button label="Save store settings" onClick={() => setSaveNotice(true)} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
        <p style={{ margin: 0, color: theme.colors.textSecondary }}>
          Review the store profile that customers will see.
        </p>
        <Badge label="Placeholder form — Xano store-update endpoint pending" tone="warning" />
        <Input label="Store name" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="Store address" value={address} onChange={(event) => setAddress(event.target.value)} />
        <Input label="Business hours" value={businessHours} onChange={(event) => setBusinessHours(event.target.value)} />
        {saveNotice ? (
          <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            No live changes were made. Claude will connect this button to Xano when the update contract is confirmed.
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
