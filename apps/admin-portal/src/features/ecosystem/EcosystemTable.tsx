import type { ReactNode } from "react";

export function EcosystemTable({
  columns,
  emptyTitle,
  emptyDescription,
  action,
}: {
  columns: string[];
  emptyTitle: string;
  emptyDescription: string;
  action?: ReactNode;
}) {
  return (
    <section className="ecosystem-table-shell">
      <div className="ecosystem-table-toolbar">
        <label><span className="sr-only">Search records</span><input placeholder="Search records…" disabled aria-describedby="ecosystem-search-contract" /></label>
        <span id="ecosystem-search-contract">Search activates with the list endpoint.</span>
        {action}
      </div>
      <div className="ecosystem-table" role="table" aria-label={emptyTitle}>
        <div className="ecosystem-table__head" role="row" style={{ gridTemplateColumns: "repeat(" + columns.length + ", minmax(120px, 1fr))" }}>
          {columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
        </div>
        <div className="ecosystem-table__empty">
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      </div>
    </section>
  );
}

export function MissingContractPanel({
  title,
  endpoint,
  purpose,
  onClose,
}: {
  title: string;
  endpoint: string;
  purpose: string;
  onClose?: () => void;
}) {
  return (
    <aside className="ecosystem-contract-panel" role="status">
      <div><span>MISSING CONTRACT</span><h2>{title}</h2><p>No record has been created or changed.</p></div>
      <dl>
        <div><dt>Method</dt><dd>GET, POST, PATCH</dd></div>
        <div><dt>Endpoint</dt><dd>{endpoint}</dd></div>
        <div><dt>Authorization</dt><dd>Authorized Admin; mutation must write an audit event</dd></div>
        <div><dt>Purpose</dt><dd>{purpose}</dd></div>
      </dl>
      {onClose ? <button type="button" onClick={onClose}>Close requirement</button> : null}
    </aside>
  );
}
