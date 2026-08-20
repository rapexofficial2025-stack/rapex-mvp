import { useState } from "react";
import { Badge, Button, Modal, useTheme } from "@rapex/ui-web";
import { formatPeso } from "@rapex/utils";

export type ReceiptOrder = {
  id: string;
  customer: string;
  itemSummary: string;
  total: number;
  status: string;
};

type ReceiptPreviewProps = { order: ReceiptOrder; onClose: () => void };

/** Print layout only. A legally valid receipt number, QR payload, VAT, and settlement data must come from Xano. */
export function ReceiptPreview({ order, onClose }: ReceiptPreviewProps) {
  const theme = useTheme();
  const [requestOpen, setRequestOpen] = useState(false);

  return <>
    <Modal title={`Receipt preview — ${order.id}`} onClose={onClose} footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Button label="Request Official Receipt" variant="secondary" onClick={() => setRequestOpen(true)} /><Button label="Print receipt" onClick={() => window.print()} /></div>}>
      <article className="rapex-print-receipt" aria-label={`Printable receipt for ${order.id}`}>
        <header className="rapex-print-receipt__header">
          <div><strong>RAPEX</strong><span>Merchant receipt</span></div>
          <span className="rapex-print-receipt__state">ORDER RECORD</span>
        </header>
        <p className="rapex-print-receipt__notice">Preview only. This is not a BIR Official Receipt or invoice until Xano issues a legal receipt number and tax fields.</p>
        <dl className="rapex-print-receipt__meta">
          <div><dt>Order reference</dt><dd>{order.id}</dd></div>
          <div><dt>Receipt status</dt><dd>Digital order record</dd></div>
          <div><dt>Customer</dt><dd>{order.customer}</dd></div>
          <div><dt>Order status</dt><dd>{order.status}</dd></div>
        </dl>
        <div className="rapex-print-receipt__line" />
        <div className="rapex-print-receipt__item"><span>{order.itemSummary}</span><strong>{formatPeso(order.total)}</strong></div>
        <div className="rapex-print-receipt__line" />
        <div className="rapex-print-receipt__total"><span>Total</span><strong>{formatPeso(order.total)}</strong></div>
        <section className="rapex-print-receipt__tax">
          <span>VAT / non-VAT, commission, payment reference, masked bank account, settlement, and QR verification payload require the issued-receipt API.</span>
        </section>
        <section className="rapex-print-receipt__qr" aria-label="Receipt QR pending issuance"><div aria-hidden="true">QR</div><p>Secure receipt QR is issued by Xano after the receipt is finalized.</p></section>
        <footer>Keep this order reference for support and audit: {order.id}</footer>
      </article>
      <div style={{ marginTop: theme.spacing.md }}><Badge label="No receipt or tax record has been created" tone="warning" /></div>
    </Modal>
    {requestOpen ? <Modal title="Official Receipt issuance request" onClose={() => setRequestOpen(false)} footer={<Button label="Close" variant="secondary" onClick={() => setRequestOpen(false)} />}><p style={{ margin: 0, color: theme.colors.textSecondary }}>This request must call an authenticated Xano endpoint that verifies the completed order, merchant tax profile, VAT treatment, BIR numbering series, and audit trail. No request has been submitted from this UI.</p></Modal> : null}
  </>;
}
