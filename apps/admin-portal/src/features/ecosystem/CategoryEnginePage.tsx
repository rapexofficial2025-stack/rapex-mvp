import { useState } from "react";
import { EcosystemTable, MissingContractPanel } from "./EcosystemTable";

type CategoryDomain = "Product" | "Service" | "Pre-Loved" | "Auction";

const DOMAINS: CategoryDomain[] = ["Product", "Service", "Pre-Loved", "Auction"];

export function CategoryEnginePage({ initialDomain = "Product" }: { initialDomain?: CategoryDomain }) {
  const [domain, setDomain] = useState<CategoryDomain>(initialDomain);
  const [formOpen, setFormOpen] = useState(false);
  const [contractVisible, setContractVisible] = useState(false);

  function handlePreviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormOpen(false);
    setContractVisible(true);
  }

  return (
    <section className="ecosystem-page">
      <header className="ecosystem-page-header">
        <div><span className="ecosystem-eyebrow">Catalog · category engine</span><h1>Marketplace categories</h1><p>Keep Product, Service, Pre‑Loved, and Auction categories separated while reusing one management system.</p></div>
        <button className="ecosystem-primary-action" type="button" onClick={() => setFormOpen(true)}>Add category</button>
      </header>

      <nav className="ecosystem-tabs" aria-label="Category domain">
        {DOMAINS.map((item) => <button type="button" className={domain === item ? "is-active" : undefined} aria-current={domain === item ? "page" : undefined} key={item} onClick={() => setDomain(item)}>{item}</button>)}
      </nav>

      <div className="ecosystem-domain-summary">
        <span>Category domain</span><strong>{domain.toUpperCase()}</strong><p>Inactive categories remain attached to historical listings and cannot be selected for new listings.</p>
      </div>

      <EcosystemTable
        columns={["Category", "Parent", "Description", "Active", "Listings", "Created", "Updated", "Actions"]}
        emptyTitle={"No " + domain + " categories loaded"}
        emptyDescription={"The frontend will not hardcode or fabricate " + domain.toLowerCase() + " category records. Connect the category-engine list endpoint to populate this table."}
      />

      {formOpen ? (
        <div className="ecosystem-modal-backdrop" role="presentation">
          <section className="ecosystem-modal" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
            <header><div><span className="ecosystem-eyebrow">Frontend contract preview</span><h2 id="category-form-title">Add {domain} category</h2></div><button type="button" onClick={() => setFormOpen(false)}>Close</button></header>
            <form onSubmit={handlePreviewSubmit}>
              <label><span>Category name</span><input required /></label>
              <label><span>Description</span><textarea required rows={3} /></label>
              <div className="ecosystem-form-row">
                <label><span>Category type</span><input value={domain.toUpperCase()} readOnly /></label>
                <label><span>Parent category</span><select disabled><option>Requires category list endpoint</option></select></label>
              </div>
              <div className="ecosystem-form-row">
                <label><span>Icon reference</span><input placeholder="Asset key or URL contract" /></label>
                <label><span>Sort order</span><input type="number" min="0" defaultValue="0" /></label>
              </div>
              <label className="ecosystem-checkbox"><input type="checkbox" defaultChecked /><span>Active for new listings</span></label>
              <p>No save API is called. Submitting this preview only displays the missing contract.</p>
              <button className="ecosystem-primary-action" type="submit">Review required save contract</button>
            </form>
          </section>
        </div>
      ) : null}

      {contractVisible ? <MissingContractPanel title={domain + " category engine"} endpoint="/categories?domain={domain} and /categories/{id}" purpose="List, create, edit, activate, and deactivate domain-scoped categories without deleting referenced history." onClose={() => setContractVisible(false)} /> : null}
    </section>
  );
}
