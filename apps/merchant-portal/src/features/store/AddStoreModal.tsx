import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useCreateStoreAction } from "@rapex/api-client";

type AddStoreModalProps = {
  onClose: () => void;
  onCreated: (storeId: string) => void;
};

export function AddStoreModal({ onClose, onCreated }: AddStoreModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const createStore = useCreateStoreAction();

  return (
    <Modal
      title="Add Store"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Create Store"
            loading={createStore.loading}
            disabled={!name || !category || !address}
            onClick={async () => {
              const store = await createStore.execute({ name, category, address });
              onCreated(store.id);
            }}
          />
        </>
      }
    >
      <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      {createStore.error ? <ErrorState description={createStore.error} /> : null}
    </Modal>
  );
}
