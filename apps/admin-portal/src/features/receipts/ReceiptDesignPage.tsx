import { useState } from "react";
import { Button } from "@rapex/ui-web";

const LAYERS = ["RAPEX logo", "Merchant legal name", "Order / receipt reference", "VAT or non-VAT line", "Commission disclosure", "Masked bank details", "QR verification", "Audit footer"];

/** Design controls only. Legal receipts must be rendered and numbered by a server-side issuance service. */
export function ReceiptDesignPage() {
  const [layers, setLayers] = useState(() => new Set(LAYERS));
  const [notice, setNotice] = useState<string | null>(null);
  const toggle = (layer: string) => setLayers((current) => { const next = new Set(current); if (next.has(layer)) next.delete(layer); else next.add(layer); return next; });
  return <div className="ecosystem-page">
    <header className="ecosystem-page-header"><div><span className="ecosystem-eyebrow">SUPER ADMIN · RECEIPT DESIGN</span><h1>Receipt template controls</h1><p>Configure an approved document layout without exposing bank account numbers, passwords, or raw payment secrets in the frontend.</p></div><span className="ecosystem-contract-badge">Super Admin policy required</span></header>
    <section className="receipt-layout-grid">
      <form className="receipt-settings-card" onSubmit={(event) => { event.preventDefault(); setNotice("No design was saved. Receipt templates require a Super Admin authorization policy, versioning, and an audit event in Xano."); }}>
        <h2>Template details</h2>
        <label>Brand / issuer name<input defaultValue="RAPEX Marketplace" /></label>
        <label>Merchant legal-name source<select defaultValue="merchant-profile"><option value="merchant-profile">Merchant verified legal profile</option><option value="not-ready">Requires tax profile contract</option></select></label>
        <label>Tax display<select defaultValue="dynamic"><option value="dynamic">Use server-issued VAT treatment</option><option value="not-ready">VAT mode unavailable</option></select></label>
        <label>Print format<select defaultValue="thermal"><option value="thermal">80 mm thermal / POS</option><option value="lq">Epson LQ-310 continuous paper</option><option value="a4">A4 audit copy</option></select></label>
        <p>Logo uploads, tax registration data, bank details, receipt numbering, and QR payloads must be provided only by authorized backend endpoints.</p>
        <Button label="Review save contract" type="submit" />
      </form>
      <section className="receipt-settings-card"><h2>Visible layers</h2><p>Select the parts that a server-issued document may display. Every change must create a versioned audit record.</p><div className="receipt-layer-list">{LAYERS.map((layer) => <label key={layer}><input type="checkbox" checked={layers.has(layer)} onChange={() => toggle(layer)} />{layer}</label>)}</div><div className="receipt-mini-preview"><span>RAPEX</span><strong>Official receipt layout preview</strong><small>{layers.size} approved visual layers selected locally</small></div></section>
    </section>
    {notice ? <section className="ecosystem-contract-panel"><div><span>NO WRITE PERFORMED</span><h2>Receipt design contract</h2><p>{notice}</p></div><dl><div><dt>ACCESS</dt><dd>Super Admin only; never client-side PIN alone</dd></div><div><dt>SAVE</dt><dd>Versioned template with activation window</dd></div><div><dt>ISSUE</dt><dd>Server assigns legal number, QR payload and tax data</dd></div><div><dt>AUDIT</dt><dd>Record editor, previous version and effective time</dd></div></dl><button type="button" onClick={() => setNotice(null)}>Close</button></section> : null}
  </div>;
}
