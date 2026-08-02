import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useUpdateStoreAction, type MerchantStore } from "@rapex/api-client";

type EditStoreProfileModalProps = {
  store: MerchantStore;
  onClose: () => void;
  onSaved: () => void;
};

export function EditStoreProfileModal({ store, onClose, onSaved }: EditStoreProfileModalProps) {
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [phone, setPhone] = useState(store.phone);
  const [businessHours, setBusinessHours] = useState(store.businessHours);
  const [address, setAddress] = useState(store.address);
  const updateStore = useUpdateStoreAction();

  return (
    <Modal
      title="Edit Store Profile"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Save Changes"
            loading={updateStore.loading}
            disabled={!name || !address}
            onClick={async () => {
              await updateStore.execute(store.id, { name, description, phone, businessHours, address });
              onSaved();
            }}
          />
        </>
      }
    >
      <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input label="Business Hours" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      {updateStore.error ? <ErrorState description={updateStore.error} /> : null}
    </Modal>
  );
}
