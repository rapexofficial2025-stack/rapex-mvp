import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useCreateVariantAction } from "@rapex/api-client";

type AddVariantModalProps = {
  productId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function AddVariantModal({ productId, onClose, onCreated }: AddVariantModalProps) {
  const [name, setName] = useState("");
  const [priceDelta, setPriceDelta] = useState("0");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const createVariant = useCreateVariantAction();

  return (
    <Modal
      title="Add Variant"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Create Variant"
            loading={createVariant.loading}
            disabled={!name || !sku}
            onClick={async () => {
              await createVariant.execute(productId, { name, priceDelta: Number(priceDelta), stock: Number(stock), sku });
              onCreated();
            }}
          />
        </>
      }
    >
      <Input label="Variant Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
      <Input label="Price Adjustment (₱)" type="number" value={priceDelta} onChange={(e) => setPriceDelta(e.target.value)} />
      <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      {createVariant.error ? <ErrorState description={createVariant.error} /> : null}
    </Modal>
  );
}
