import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useCreateProductAction } from "@rapex/api-client";

type AddProductModalProps = {
  storeId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function AddProductModal({ storeId, onClose, onCreated }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const createProduct = useCreateProductAction();

  return (
    <Modal
      title="Add Product"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Create Product"
            loading={createProduct.loading}
            disabled={!name || !price || !productCategory}
            onClick={async () => {
              await createProduct.execute(storeId, { name, price: Number(price), productCategory });
              onCreated();
            }}
          />
        </>
      }
    >
      <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Price (₱)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input label="Category" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} />
      {createProduct.error ? <ErrorState description={createProduct.error} /> : null}
    </Modal>
  );
}
