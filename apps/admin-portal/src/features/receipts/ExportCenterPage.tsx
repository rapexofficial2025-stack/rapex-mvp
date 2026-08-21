import { useState } from "react";
import { Button } from "@rapex/ui-web";

const FORMATS = ["CSV", "PDF", "JPEG", "Google Sheets"] as const;
const DATASETS = ["Orders", "Order financials", "Receipt issuance history", "Wallet transactions", "Audit logs"] as const;

/** Export requests remain server-authorized. No table data is exported from preview state. */
export function ExportCenterPage() {
  const [dataset, setDataset] = useState<(typeof DATASETS)[number]>("Orders");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("CSV");
  const [pin, setPin] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  return <div className="ecosystem-page">
    <header className="ecosystem-page-header"><div><span className="ecosystem-eyebrow">SUPER ADMIN · AUDIT EXPORT</span><h1>Secure export center</h1><p>Export requests must be authorized server-side, captured in the audit log, and returned as a short-lived signed file. This page does not export placeholder data.</p></div><span className="ecosystem-contract-badge">No export performed</span></header>
    <section className="receipt-layout-grid">
      <form className="receipt-settings-card" onSubmit={(event) => { event.preventDefault(); setNotice("No export was created. A PIN alone is not sufficient: Xano must verify the authenticated Super Admin role, validate the PIN/step-up challenge, limit the dataset, create an audit event, then issue a short-lived export URL."); }}>
        <h2>Create audited export request</h2>
        <label>Data set<select value={dataset} onChange={(event) => setDataset(event.target.value as typeof dataset)}>{DATASETS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Format<select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>{FORMATS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Date range<input value="Requires server-side date filters" readOnly /></label>
        <label>Super Admin PIN / step-up confirmation<input value={pin} onChange={(event) => setPin(event.target.value)} type="password" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter only on a live secured session" /></label>
        <p>Google Sheets requires an approved connection and server-side OAuth scope. Never place a Sheet token in the browser.</p>
        <Button label="Request secure export" type="submit" />
      </form>
      <section className="receipt-settings-card"><h2>Required export record</h2><dl className="export-contract-list"><div><dt>Actor</dt><dd>Authenticated Super Admin ID and role</dd></div><div><dt>Scope</dt><dd>Dataset, filters, fields and date range</dd></div><div><dt>Format</dt><dd>{format} conversion created server-side</dd></div><div><dt>Trace</dt><dd>Reason, IP/device policy, timestamp, audit ID</dd></div><div><dt>Delivery</dt><dd>Short-lived signed download URL or permitted Sheet append</dd></div></dl></section>
    </section>
    {notice ? <section className="ecosystem-contract-panel"><div><span>AUTHORIZATION REQUIRED</span><h2>Super Admin export policy</h2><p>{notice}</p></div><dl><div><dt>POST</dt><dd>/admin/exports/request</dd></div><div><dt>VERIFY</dt><dd>Session role + step-up PIN/OTP, server-side</dd></div><div><dt>RESPONSE</dt><dd>Audit ID, status, short-lived file URL when approved</dd></div><div><dt>GOOGLE SHEETS</dt><dd>Server connection, scoped workbook and audit trail</dd></div></dl><button type="button" onClick={() => setNotice(null)}>Close</button></section> : null}
  </div>;
}
