import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useCreateEngineTierAction, type EngineKey } from "@rapex/api-client";

type AddEngineTierModalProps = {
  engineKey: EngineKey;
  onClose: () => void;
  onCreated: () => void;
};

export function AddEngineTierModal({ engineKey, onClose, onCreated }: AddEngineTierModalProps) {
  const [label, setLabel] = useState("");
  const [fromAmount, setFromAmount] = useState("0");
  const [toAmount, setToAmount] = useState("");
  const [commissionRatePercent, setCommissionRatePercent] = useState("0");
  const [markupRatePercent, setMarkupRatePercent] = useState("0");
  const [active, setActive] = useState(true);
  const createTier = useCreateEngineTierAction();

  return (
    <Modal
      title="Add Rule"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Add Rule"
            loading={createTier.loading}
            disabled={!label || fromAmount === ""}
            onClick={async () => {
              await createTier.execute(engineKey, {
                label,
                fromAmount: Number(fromAmount),
                toAmount: toAmount === "" ? null : Number(toAmount),
                commissionRatePercent: Number(commissionRatePercent),
                markupRatePercent: Number(markupRatePercent),
                active,
              });
              onCreated();
            }}
          />
        </>
      }
    >
      <Input label="Rule Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Tier 1" />
      <div style={{ display: "flex", gap: 8 }}>
        <Input label="From Amount" type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} />
        <Input label="To Amount (blank = no limit)" type="number" value={toAmount} onChange={(e) => setToAmount(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Input label="Commission Rate %" type="number" value={commissionRatePercent} onChange={(e) => setCommissionRatePercent(e.target.value)} />
        <Input label="Markup Rate %" type="number" value={markupRatePercent} onChange={(e) => setMarkupRatePercent(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button label="Active" size="sm" variant={active ? "primary" : "outline"} onClick={() => setActive(true)} />
        <Button label="Inactive" size="sm" variant={!active ? "primary" : "outline"} onClick={() => setActive(false)} />
      </div>
      {createTier.error ? <ErrorState description={createTier.error} /> : null}
    </Modal>
  );
}
