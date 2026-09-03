import type { ReactNode } from "react";

const LOGO = new URL("../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;

export function MerchantAuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="merchant-auth">
      <header className="merchant-auth__topbar">
        <div className="merchant-auth__topbar-brand">
          <img src={LOGO} alt="RAPEX" />
          <span>MERCHANT CENTER</span>
        </div>
        <nav className="merchant-auth__topbar-nav" aria-label="Merchant Center">
          <span>Product<em>Produkto</em></span>
          <span>Features<em>Mga Tampok</em></span>
          <span>Partnership<em>Pakikipagsosyo</em></span>
          <span>Earn<em>Kumita</em></span>
          <span>Privacy &amp; Security<em>Pribasiya at Seguridad</em></span>
          <span>About<em>Tungkol Sa Amin</em></span>
        </nav>
        <div className="merchant-auth__topbar-meta">
          <span>Merchant benefits</span>
          <span>How to start</span>
          <span className="merchant-auth__topbar-locale">PH Philippines · English</span>
        </div>
      </header>

      <section className="merchant-auth__frame" aria-label="RAPEX Merchant authentication">
        <div className="merchant-auth__story">
          <span className="merchant-auth__kicker">— DELIVERING THE FUTURE TODAY</span>
          <h2>Grow your local business beyond your storefront.</h2>
          <p>
            Bring your store online, connect with nearby customers, receive more orders, and grow your
            business with RAPEX — the Philippines&rsquo; first Hybrid and Hyperlocal Marketplace.
            <br />
            <strong>Gawang Lokal Para sa Masa.</strong>
          </p>
          <div className="merchant-auth__benefits" aria-label="Merchant portal stats">
            <span>
              <strong>2–50 KM</strong>
              <em>Customer visibility</em>
            </span>
            <span>
              <strong>24/7</strong>
              <em>Marketplace visibility</em>
            </span>
            <span>
              <strong>1,000</strong>
              <em>Pilot user target</em>
            </span>
            <span>
              <strong>1K+</strong>
              <em>Potential customer reach</em>
            </span>
          </div>
          <div className="merchant-auth__cta-box">
            <p>
              Be one of the first RAPEX Merchant Pioneers and get early access to merchant benefits,
              promotions, and growth opportunities.
            </p>
            <button type="button" className="merchant-auth__register-now">
              REGISTER NOW <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="merchant-auth__form-panel">
          <div className="merchant-auth__form-card">
            <span className="merchant-auth__eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="merchant-auth__description">{description}</p>
            {children}
          </div>
        </div>
      </section>

      <footer className="merchant-auth__footer" aria-hidden="true">
        <div className="merchant-auth__footer-gray" />
        <div className="merchant-auth__footer-purple" />
      </footer>
    </main>
  );
}
