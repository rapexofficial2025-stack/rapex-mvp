import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMerchantStoreWorkspace } from "../workspace/useMerchantStoreWorkspace";

type ListingType = "product" | "service" | "auction" | "pre-loved";

const LISTING_TYPES: { key: ListingType; title: string; description: string; requires: string }[] = [
  { key: "product", title: "Product", description: "Physical inventory owned by the selected store.", requires: "Existing product creation contract" },
  { key: "service", title: "Service", description: "Bookable work offered by a verified freelancer or provider company.", requires: "Service-provider capability" },
  { key: "auction", title: "Auction", description: "Timed bidding workflow with seller authorization and auction states.", requires: "Auction seller capability" },
  { key: "pre-loved", title: "Pre-Loved", description: "Condition-based resale listing kept separate from store inventory.", requires: "Pre-Loved seller contract" },
];

export function ListingTypeSelectorPage({ previewMode = false }: { previewMode?: boolean }) {
  const navigate = useNavigate();
  const { currentStore } = useMerchantStoreWorkspace();
  const [selectedType, setSelectedType] = useState<ListingType>("product");
  const selected = LISTING_TYPES.find((listing) => listing.key === selectedType)!;

  return (
    <section className="ecosystem-page">
      <header className="ecosystem-page-header">
        <div>
          <span className="ecosystem-eyebrow">Marketplace listing center</span>
          <h1>Create listing</h1>
          <p>Choose the transaction workflow first. Product, Service, Auction, and Pre‑Loved never share one giant form.</p>
        </div>
        <span className="ecosystem-contract-badge">No listing submitted</span>
      </header>

      <div className="ecosystem-listing-context">
        <span>Store workspace</span>
        <strong>{currentStore?.name ?? "No store selected"}</strong>
        <small>{currentStore ? currentStore.address : "A real store is required for store-owned product listings."}</small>
      </div>

      <div className="ecosystem-listing-grid" role="radiogroup" aria-label="Listing type">
        {LISTING_TYPES.map((listing) => (
          <button
            className={selectedType === listing.key ? "ecosystem-listing-type is-selected" : "ecosystem-listing-type"}
            type="button"
            role="radio"
            aria-checked={selectedType === listing.key}
            key={listing.key}
            onClick={() => setSelectedType(listing.key)}
          >
            <span>{listing.title.charAt(0)}</span>
            <strong>{listing.title}</strong>
            <small>{listing.description}</small>
          </button>
        ))}
      </div>

      <section className="ecosystem-selection-summary">
        <div>
          <span>Selected workflow</span>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
        </div>
        <dl>
          <div><dt>Required</dt><dd>{selected.requires}</dd></div>
          <div><dt>Data ownership</dt><dd>{selectedType === "product" ? "Selected Store" : "Authorized account capability"}</dd></div>
          <div><dt>Current state</dt><dd>{selectedType === "product" ? "Basic Xano product creation exists" : "MISSING CONTRACT"}</dd></div>
        </dl>
        {selectedType === "product" ? (
          <button className="ecosystem-primary-action" type="button" onClick={() => navigate(previewMode ? "/portal/preview/products/add" : "/portal/products/add")}>{previewMode ? "Preview Add Product" : "Add a product"}</button>
        ) : (
          <button className="ecosystem-primary-action" type="button" onClick={() => navigate(previewMode ? "/login" : "/portal/capabilities")}>Review required capability</button>
        )}
      </section>
    </section>
  );
}
