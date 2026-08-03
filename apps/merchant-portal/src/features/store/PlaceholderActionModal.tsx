import { Badge, Button, Modal } from "@rapex/ui-web";

type PlaceholderActionModalProps = {
  title: string;
  description: string;
  onClose: () => void;
};

export function PlaceholderActionModal({ title, description, onClose }: PlaceholderActionModalProps) {
  return (
    <Modal title={title} onClose={onClose} footer={<Button label="Close" variant="secondary" onClick={onClose} />}>
      <p style={{ margin: 0 }}>{description}</p>
      <Badge label="Ready for Xano Integration" tone="info" />
    </Modal>
  );
}
