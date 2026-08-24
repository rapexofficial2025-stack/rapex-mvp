import { useState, type ChangeEvent, type FormEvent } from "react";
import { EcosystemTable, MissingContractPanel } from "./EcosystemTable";

type CategoryDomain = "Product" | "Service" | "Pre-Loved" | "Auction";

const DOMAINS: CategoryDomain[] = ["Product", "Service", "Pre-Loved", "Auction"];

export function CategoryEnginePage({ initialDomain = "Product" }: { initialDomain?: CategoryDomain }) {
  const [domain, setDomain] = useState<CategoryDomain>(initialDomain);
  const [formOpen, setFormOpen] = useState(false);
  const [contractVisible, setContractVisible] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [variantInput, setVariantInput] = useState("");
  const [assetPreview, setAssetPreview] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string | null>(null);

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormOpen(false);
    setContractVisible(true);
  }

  function addTag() {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((current) => [...current, value]);
    setTagInput("");
  }

  function addVariant() {
    const value = variantInput.trim();
    if (!value || variants.includes(value)) return;
    setVariants((current) => [...current, value]);
    setVariantInput("");
  }

  function handleAssetChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAssetPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
    setAssetName(file.name);
  }

  return (
    <section className="ecosystem-page category-engine-page">
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
            <form className="category-engine-form" onSubmit={handlePreviewSubmit}>
              <label><span>Category name</span><input required /></label>
              <label><span>Description</span><textarea required rows={3} /></label>
              <div className="ecosystem-form-row">
                <label><span>Category type</span><input value={domain.toUpperCase()} readOnly /></label>
                <label><span>Category level</span><select defaultValue="main"><option value="main">Main category</option><option value="sub">Sub category</option><option value="store">Store category</option><option value="product">Product category</option></select></label>
              </div>
              <div className="ecosystem-form-row">
                <label><span>Parent category</span><select defaultValue=""><option value="">Please select main category to add under</option><option disabled>Requires Xano category list</option></select></label>
                <label><span>Sort order</span><input type="number" min="0" defaultValue="0" /></label>
              </div>
              <label><span>Category image or GIF</span><input type="file" accept="image/png,image/gif" onChange={handleAssetChange} /><small>PNG and GIF preview only. Upload/storage contract remains required.</small></label>
              {assetPreview ? <div className="category-engine-asset"><img src={assetPreview} alt="Selected category asset preview" /><span>{assetName}</span><button type="button" onClick={() => { setAssetPreview(null); setAssetName(null); }}>Remove preview</button></div> : null}
              <div className="category-engine-token-group"><span>Tags</span><div><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="e.g. fresh, featured" /><button type="button" onClick={addTag}>Add tag</button></div><div className="category-engine-tokens">{tags.length ? tags.map((tag) => <button type="button" key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}<span>Remove</span></button>) : <small>No tags added in this local preview.</small>}</div></div>
              <div className="category-engine-token-group"><span>Variant labels</span><div><input value={variantInput} onChange={(event) => setVariantInput(event.target.value)} placeholder="e.g. size, color, serving" /><button type="button" onClick={addVariant}>Add variant</button></div><div className="category-engine-tokens">{variants.length ? variants.map((variant) => <button type="button" key={variant} onClick={() => setVariants((current) => current.filter((item) => item !== variant))}>{variant}<span>Remove</span></button>) : <small>Variants require the product-variants contract after category creation.</small>}</div></div>
              <label className="ecosystem-checkbox"><input type="checkbox" defaultChecked /><span>Active for new listings</span></label>
              <p>No save API is called. This form collects a UI preview only; Xano must create the main/sub/store/product category, tags, asset reference, and variants.</p>
              <button className="ecosystem-primary-action" type="submit">Review required save contract</button>
            </form>
          </section>
        </div>
      ) : null}

      {contractVisible ? <MissingContractPanel title={domain + " category engine"} endpoint="/categories?domain={domain} and /categories/{id}" purpose="List, create, edit, activate, and deactivate domain-scoped categories without deleting referenced history." onClose={() => setContractVisible(false)} /> : null}
    </section>
  );
}
