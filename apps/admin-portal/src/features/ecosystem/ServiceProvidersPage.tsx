import { useState } from "react";
import { EcosystemTable, MissingContractPanel } from "./EcosystemTable";

const TABS = ["All Providers", "Freelancers", "Companies", "Pending Verification", "Approved", "Rejected", "Suspended"] as const;

export function ServiceProvidersPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All Providers");
  const [contractVisible, setContractVisible] = useState(false);

  return (
    <section className="ecosystem-page">
      <header className="ecosystem-page-header">
        <div><span className="ecosystem-eyebrow">Marketplace operations</span><h1>Service providers</h1><p>Freelancers and provider companies share verification oversight, but keep distinct profile and operating models.</p></div>
        <span className="ecosystem-contract-badge">No provider records fabricated</span>
      </header>

      <div className="ecosystem-provider-types">
        <article><span>Individual</span><h2>Freelancer</h2><p>One verified person personally provides the listed services.</p></article>
        <article><span>Organization</span><h2>Provider Company</h2><p>A verified business manages services, service areas, and team membership.</p></article>
      </div>

      <nav className="ecosystem-tabs" aria-label="Service provider status">
        {TABS.map((tab) => <button type="button" className={activeTab === tab ? "is-active" : undefined} aria-current={activeTab === tab ? "page" : undefined} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </nav>

      <EcosystemTable
        columns={["Provider", "Type", "Primary Category", "Location", "Verification", "Availability", "Rating", "Status", "Created", "Actions"]}
        emptyTitle={"No " + activeTab.toLowerCase() + " loaded"}
        emptyDescription="The provider list endpoint and role-specific response schema are not available in the local repository. No sample identities were generated."
        action={<button className="ecosystem-secondary-action" type="button" onClick={() => setContractVisible(true)}>View API requirement</button>}
      />

      {contractVisible ? <MissingContractPanel title="Service Provider Admin suite" endpoint="/service-providers, /service-providers/{id}, and verification/status mutation endpoints" purpose="List freelancers and companies separately, inspect verification, and perform audited approval/status actions." onClose={() => setContractVisible(false)} /> : null}
    </section>
  );
}
