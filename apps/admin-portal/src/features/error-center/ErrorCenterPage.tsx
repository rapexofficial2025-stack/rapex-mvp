import { useState } from "react";

const INCIDENT_TABS = ["All incidents", "Open", "Acknowledged", "Resolved"] as const;
const TABLE_COLUMNS = ["Error ID", "Severity", "Application", "Module", "Endpoint", "Client (redacted)", "Occurrences", "First seen", "Last seen", "Status"];

/**
 * Read-only by design. Batch 5 specifies only GET /admin-master-data/errors;
 * acknowledgement, assignment, and resolution remain unavailable until their
 * audited Xano actions have a confirmed contract.
 */
export function ErrorCenterPage() {
  const [activeTab, setActiveTab] = useState<(typeof INCIDENT_TABS)[number]>("All incidents");

  return (
    <section className="admin-error-center">
      <header className="admin-error-center__header">
        <div>
          <span className="admin-error-center__eyebrow">System observability</span>
          <h1>Error Center</h1>
          <p>Read-only incident monitoring for RAPEX applications and platform services.</p>
        </div>
        <div className="admin-error-center__contract" role="status">
          <strong>Xano data contract required</strong>
          <span>GET /admin-master-data/errors</span>
        </div>
      </header>

      <section className="admin-error-center__guardrails" aria-label="Error Center guardrails">
        <article><span>Visibility</span><strong>Incident monitoring</strong><p>Search, severity, and status filtering will use the published Xano query fields.</p></article>
        <article><span>Privacy</span><strong>Server-redacted client data</strong><p>Client identifiers must already be masked by Xano before they reach this page.</p></article>
        <article><span>Safety</span><strong>Read-only until audited</strong><p>Acknowledge, assign, and resolve actions are intentionally unavailable.</p></article>
      </section>

      <section className="admin-error-center__workspace" aria-label="Incident workspace">
        <div className="admin-error-center__toolbar">
          <div className="admin-error-center__tabs" role="tablist" aria-label="Incident status">
            {INCIDENT_TABS.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>
          <div className="admin-error-center__filters">
            <label><span className="sr-only">Severity filter</span><select aria-label="Severity filter" defaultValue=""><option value="">All severities</option><option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option></select></label>
            <span>Local filter selection only — no records loaded</span>
          </div>
        </div>

        <div className="admin-error-center__table" role="region" aria-label={`${activeTab} incident table`} tabIndex={0}>
          <div className="admin-error-center__table-head">
            {TABLE_COLUMNS.map((column) => <span key={column}>{column}</span>)}
          </div>
          <div className="admin-error-center__empty">
            <strong>No incident records loaded</strong>
            <p>This view will populate only after the published, paginated error-monitoring endpoint is connected. No sample incidents are shown as real operational data.</p>
          </div>
        </div>
      </section>

      <footer className="admin-error-center__footer">
        <span>Required response fields: severity, application, module, endpoint, masked client reference, occurrence count, timestamps, and status.</span>
        <span>Mutation controls remain locked pending audited Xano contracts.</span>
      </footer>
    </section>
  );
}
