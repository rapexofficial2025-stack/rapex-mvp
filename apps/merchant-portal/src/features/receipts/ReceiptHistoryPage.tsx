import { useState } from "react";
import { Button } from "@rapex/ui-web";
import { ReceiptPreview, type ReceiptOrder } from "./ReceiptPreview";

/** No receipt rows are invented. This becomes a real history only after the receipt list contract is approved. */
export function ReceiptHistoryPage() {
  const [selected, setSelected] = useState<ReceiptOrder | null>(null);
  return <div className="ecosystem-page merchant-receipt-history">
    <header className="ecosystem-page-header"><div><span className="ecosystem-eyebrow">OPERATIONS · RECEIPTS</span><h1>Receipt history</h1><p>Find issued order receipts, request official receipts where eligible, and print a single audit-friendly copy.</p></div><span className="ecosystem-contract-badge">Receipt API required</span></header>
    <section className="ecosystem-table-shell" aria-label="Receipt history">
      <div className="ecosystem-table-toolbar"><label><span className="sr-only">Search receipts</span><input disabled placeholder="Search activates with the receipt-history endpoint" /></label><span>No receipt records are fabricated.</span><Button label="Print current view" variant="secondary" onClick={() => window.print()} /></div>
      <div className="ecosystem-table"><div className="ecosystem-table__head" style={{ gridTemplateColumns: "1.1fr 1fr 1fr 1fr 1fr 1fr" }}><span>RECEIPT / ORDER</span><span>ISSUED</span><span>TYPE</span><span>VAT</span><span>TOTAL</span><span>STATUS</span></div><div className="ecosystem-table__empty"><strong>No issued receipts loaded</strong><p>Required contract: an authorized, paginated receipt history filtered by store and date range. Required response fields include receipt ID, order ID, issued time, VAT mode, totals, issuance status, QR verification reference, and printable document URL.</p></div></div>
    </section>
    <section className="ecosystem-contract-panel"><div><span>MISSING CONTRACT</span><h2>Receipt history & issuance</h2><p>No official receipt has been requested or generated.</p></div><dl><div><dt>READ</dt><dd>GET /merchant/receipts with store, date, status and cursor filters</dd></div><div><dt>WRITE</dt><dd>{"POST /orders/{id}/official-receipt-request"}</dd></div><div><dt>PRINT</dt><dd>Immutable receipt payload or signed print document</dd></div><div><dt>AUDIT</dt><dd>Issuer, tax series, request, print and export events</dd></div></dl><button type="button" onClick={() => setSelected({ id: "Preview only", customer: "No customer loaded", itemSummary: "No live item data", total: 0, status: "API required" })}>View print layout</button></section>
    {selected ? <ReceiptPreview order={selected} onClose={() => setSelected(null)} /> : null}
  </div>;
}
