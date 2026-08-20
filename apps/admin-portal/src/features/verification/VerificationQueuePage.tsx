import { useMemo, useState } from "react";
import { Badge, Button, DataTable, ErrorState, Loading, type DataTableColumn } from "@rapex/ui-web";
import { useVerificationQueue, type VerificationApplicant, type VerificationApplicantRole } from "@rapex/api-client";

const ROLE_LABEL: Record<VerificationApplicantRole, string> = {
  merchant: "Merchant",
  rider: "Rider",
  "service-provider": "Service Provider",
};

type RoleFilter = "all" | VerificationApplicantRole;

export function VerificationQueuePage() {
  const { data: applicants, loading, error, refetch } = useVerificationQueue();
  const [filter, setFilter] = useState<RoleFilter>("merchant");
  const [selected, setSelected] = useState<VerificationApplicant | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const counts = useMemo(() => {
    const list = applicants ?? [];
    return {
      all: list.length,
      merchant: list.filter((applicant) => applicant.role === "merchant").length,
      rider: list.filter((applicant) => applicant.role === "rider").length,
      "service-provider": list.filter((applicant) => applicant.role === "service-provider").length,
    };
  }, [applicants]);

  const filtered = useMemo(() => {
    const list = applicants ?? [];
    return filter === "all" ? list : list.filter((applicant) => applicant.role === filter);
  }, [applicants, filter]);

  const columns: DataTableColumn<VerificationApplicant>[] = [
    { key: "name", header: "Applicant", render: (applicant) => applicant.name, sortValue: (applicant) => applicant.name },
    { key: "role", header: "Role", render: (applicant) => <Badge label={ROLE_LABEL[applicant.role]} tone="neutral" /> },
    { key: "submitted", header: "Submitted", render: (applicant) => new Date(applicant.submittedAt).toLocaleString(), sortValue: (applicant) => applicant.submittedAt },
    { key: "status", header: "Status", render: (applicant) => <Badge label={applicant.status} tone="warning" /> },
    { key: "review", header: "Action", render: (applicant) => <Button label="Review" size="sm" variant="secondary" onClick={() => { setSelected(applicant); setNotice(null); setCorrectionOpen(false); }} /> },
  ];

  if (loading) return <Loading />;
  if (error || !applicants) return <ErrorState description={error ?? "Could not load the verification queue."} onRetry={refetch} />;

  const tabs: { key: RoleFilter; label: string }[] = [
    { key: "merchant", label: `Merchants (${counts.merchant})` },
    { key: "all", label: `All (${counts.all})` },
    { key: "rider", label: `Riders (${counts.rider})` },
    { key: "service-provider", label: `Service Providers (${counts["service-provider"]})` },
  ];

  function requireContract(action: "approve" | "reject") {
    if (!selected) return;
    setNotice(`${action === "approve" ? "Approval" : "Rejection"} was not recorded. Required: an authenticated Admin endpoint for application ${selected.id} that validates the current review state, records the reviewer and reason, updates separate identity/store verification flags, and writes an immutable audit event.`);
  }

  return <div className="ecosystem-page merchant-verification-page">
    <header className="ecosystem-page-header"><div><span className="ecosystem-eyebrow">MARKETPLACE OPERATIONS · ALPHA</span><h1>Merchant verification</h1><p>Review one merchant owner and their main store in a single decision card.</p></div><span className="ecosystem-contract-badge">PREVIEW DATA · NO LIVE WRITES</span></header>

    <div className="merchant-verification-tabs" role="tablist" aria-label="Verification queue filters">
      {tabs.map((tab) => <button key={tab.key} type="button" role="tab" aria-selected={filter === tab.key} onClick={() => { setFilter(tab.key); setSelected(null); }}>{tab.label}</button>)}
    </div>

    <DataTable columns={columns} rows={filtered} rowKey={(applicant) => applicant.id} searchPlaceholder="Search applicants…" searchFn={(applicant, query) => applicant.name.toLowerCase().includes(query)} emptyMessage="No pending applications" />

    {selected ? <section className="merchant-review-card" aria-label={`Verification review for ${selected.name}`}>
      <header><div><span>MERCHANT VERIFICATION CARD</span><h2>{selected.name}</h2><p>Application {selected.id} · Submitted {new Date(selected.submittedAt).toLocaleString()}</p></div><Badge label={selected.status.toUpperCase()} tone="warning" /></header>
      <div className="merchant-review-columns">
        <section><span>MERCHANT</span><dl><div><dt>Profile photo</dt><dd>Detail API required</dd></div><div><dt>Name</dt><dd>{selected.name}</dd></div><div><dt>Email</dt><dd>Detail API required</dd></div><div><dt>Mobile</dt><dd>Detail API required</dd></div><div><dt>ID & selfie</dt><dd>{selected.documentLabels.length ? selected.documentLabels.join(", ") : "Detail API required"}</dd></div></dl></section>
        <section><span>MAIN STORE</span><dl><div><dt>Store name</dt><dd>Detail API required</dd></div><div><dt>Category</dt><dd>Detail API required</dd></div><div><dt>Location & GPS</dt><dd>Detail API required</dd></div><div><dt>Store photo</dt><dd>Detail API required</dd></div><div><dt>Documents</dt><dd>Conditional by merchant type</dd></div></dl></section>
      </div>
      <p className="merchant-review-rule">Business permits are not mandatory for every Alpha merchant. Xano must return only the documents required by that merchant's type and requested capabilities.</p>
      <footer><Button label="Approve" onClick={() => requireContract("approve")} /><Button label="Reject" variant="danger" onClick={() => requireContract("reject")} /><Button label="Request Correction" variant="secondary" onClick={() => { setCorrectionOpen(true); setNotice(null); }} /></footer>
      {correctionOpen ? <form className="merchant-correction-form" onSubmit={(event) => { event.preventDefault(); setNotice("Correction request was not sent. Required: an authenticated correction endpoint with selected fields, reviewer note, due date, notification result, resubmission status, and audit ID."); }}><label>Correction note<textarea required rows={3} placeholder="Explain only what the merchant needs to correct" /></label><div><Button label="Send correction request" type="submit" /><Button label="Cancel" type="button" variant="secondary" onClick={() => setCorrectionOpen(false)} /></div></form> : null}
      {notice ? <div className="merchant-review-notice" role="status"><strong>API required.</strong> {notice}</div> : null}
    </section> : <section className="merchant-review-empty"><strong>Select Review</strong><p>The full card opens only after an application is selected. No applicant is automatically approved.</p></section>}
  </div>;
}
