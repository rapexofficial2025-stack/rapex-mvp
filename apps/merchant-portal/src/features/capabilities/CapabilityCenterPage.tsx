import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchantStoreWorkspace } from "../workspace/useMerchantStoreWorkspace";

type CapabilityKey = "store" | "freelancer" | "company" | "rider" | "auction";

const CAPABILITIES: { key: CapabilityKey; title: string; description: string; route?: string }[] = [
  { key: "store", title: "Store Merchant", description: "Operate stores, products, inventory, orders, and delivery.", route: "/portal/store" },
  { key: "freelancer", title: "Freelancer", description: "Offer services personally through a professional provider profile." },
  { key: "company", title: "Service Provider Company", description: "Operate service listings through a company and managed team." },
  { key: "rider", title: "Rider", description: "Maintain a separate delivery capability under the same RAPEX identity." },
  { key: "auction", title: "Auction Seller", description: "Create and manage auction listings where selling is authorized." },
];

export function CapabilityCenterPage({ previewMode = false }: { previewMode?: boolean }) {
  const navigate = useNavigate();
  const { currentStore } = useMerchantStoreWorkspace();
  const [selected, setSelected] = useState<CapabilityKey | null>(null);
  const selectedCapability = CAPABILITIES.find((capability) => capability.key === selected) ?? null;

  function handleCapability(key: CapabilityKey, route?: string) {
    if (route) {
      navigate(previewMode ? "/login" : route);
      return;
    }
    setSelected(key);
  }

  return (
    <section className="ecosystem-page">
      <header className="ecosystem-page-header">
        <div>
          <span className="ecosystem-eyebrow">One identity · multiple capabilities</span>
          <h1>My RAPEX capabilities</h1>
          <p>Expand what this account can do without creating a duplicate login or merging operational workspaces.</p>
        </div>
        <span className="ecosystem-contract-badge">Capability API required</span>
      </header>

      <div className="ecosystem-account-map" aria-label="RAPEX account capability map">
        <strong>RAPEX Account</strong>
        <span>Store merchant</span><span>Freelancer</span><span>Provider company</span><span>Rider</span><span>Auction seller</span>
      </div>

      <div className="ecosystem-capability-grid">
        {CAPABILITIES.map((capability) => {
          const isStore = capability.key === "store";
          return (
            <article className="ecosystem-capability-card" key={capability.key}>
              <div className="ecosystem-capability-card__header">
                <span className="ecosystem-capability-mark" aria-hidden="true">{capability.title.charAt(0)}</span>
                <span className={isStore ? "ecosystem-status is-known" : "ecosystem-status"}>{isStore ? "Current portal" : "Status unavailable"}</span>
              </div>
              <h2>{capability.title}</h2>
              <p>{capability.description}</p>
              {isStore ? <small>Selected store: {currentStore?.name ?? "No store available"}</small> : <small>Backend authorization remains authoritative.</small>}
              <button type="button" onClick={() => handleCapability(capability.key, capability.route)}>{isStore ? (previewMode ? "Sign in to manage" : "Manage store capability") : "Review registration requirement"}</button>
            </article>
          );
        })}
      </div>

      {selectedCapability ? (
        <aside className="ecosystem-contract-panel" role="status">
          <div>
            <span>MISSING CONTRACT</span>
            <h2>{selectedCapability.title} capability</h2>
            <p>No registration, activation, or capability status was simulated.</p>
          </div>
          <dl>
            <div><dt>Method</dt><dd>GET + POST/PATCH required</dd></div>
            <div><dt>Endpoint</dt><dd>Capability list and role-specific registration endpoints required</dd></div>
            <div><dt>Authorization</dt><dd>Authenticated account owner; Admin approval where required</dd></div>
            <div><dt>Purpose</dt><dd>Read capability status and start the correct registration workflow</dd></div>
          </dl>
          <button type="button" onClick={() => setSelected(null)}>Close requirement</button>
        </aside>
      ) : null}
    </section>
  );
}
