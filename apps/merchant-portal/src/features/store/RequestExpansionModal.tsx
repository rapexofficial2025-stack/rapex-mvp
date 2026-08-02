import { useState } from "react";
import { Button, ErrorState, Input, Modal } from "@rapex/ui-web";
import { useCreateExpansionRequestAction, type ExpansionRequestType } from "@rapex/api-client";

type RequestExpansionModalProps = {
  storeId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function RequestExpansionModal({ storeId, onClose, onCreated }: RequestExpansionModalProps) {
  const [type, setType] = useState<ExpansionRequestType>("coverage-increase");
  const [requestedCoverageRadiusKm, setRequestedCoverageRadiusKm] = useState("");
  const [proposedAddress, setProposedAddress] = useState("");
  const [note, setNote] = useState("");
  const createRequest = useCreateExpansionRequestAction();

  return (
    <Modal
      title="Request Expansion"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Submit Request"
            loading={createRequest.loading}
            disabled={!note}
            onClick={async () => {
              await createRequest.execute(storeId, {
                type,
                proposedAddress: type === "new-branch" ? proposedAddress : undefined,
                requestedCoverageRadiusKm:
                  type === "coverage-increase" && requestedCoverageRadiusKm ? Number(requestedCoverageRadiusKm) : undefined,
                note,
              });
              onCreated();
            }}
          />
        </>
      }
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          label="Coverage Increase"
          size="sm"
          variant={type === "coverage-increase" ? "primary" : "outline"}
          onClick={() => setType("coverage-increase")}
        />
        <Button
          label="New Branch"
          size="sm"
          variant={type === "new-branch" ? "primary" : "outline"}
          onClick={() => setType("new-branch")}
        />
      </div>
      {type === "coverage-increase" ? (
        <Input
          label="Requested Coverage Radius (km)"
          type="number"
          value={requestedCoverageRadiusKm}
          onChange={(e) => setRequestedCoverageRadiusKm(e.target.value)}
        />
      ) : (
        <Input label="Proposed Branch Address" value={proposedAddress} onChange={(e) => setProposedAddress(e.target.value)} />
      )}
      <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why do you need this expansion?" />
      {createRequest.error ? <ErrorState description={createRequest.error} /> : null}
    </Modal>
  );
}
