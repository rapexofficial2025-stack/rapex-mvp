import type { ReactNode } from "react";

const BACKGROUND = new URL("../../../../assets/brand/Background/merchant-login.png", import.meta.url).href;
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
    <main
      className="merchant-auth"
      style={{
        backgroundImage: "linear-gradient(115deg, rgba(5, 5, 13, 0.82), rgba(14, 8, 25, 0.55)), url(" + BACKGROUND + ")",
        // Pins the background to the viewport so it never shifts/reveals a
        // gap when the page is resized, scrolled, or the browser is zoomed
        // -- browsers don't let a page block zoom itself (Ctrl+scroll/pinch
        // stay available on purpose, an accessibility protection), but the
        // background staying correctly framed regardless is what this fixes.
        backgroundAttachment: "fixed",
      }}
    >
      <section className="merchant-auth__frame" aria-label="RAPEX Merchant authentication">
        <div className="merchant-auth__story">
          <img className="merchant-auth__logo" src={LOGO} alt="RAPEX" />
          <span className="merchant-auth__kicker">RAPEX Marketplace PH</span>
          <h2>Grow your business with one merchant operating system.</h2>
          <p>Manage stores, products, orders, and performance from a consistent workspace built for daily operations.</p>
          <div className="merchant-auth__benefits" aria-label="Merchant portal benefits">
            <span>Multi-store workspace</span>
            <span>Operational visibility</span>
            <span>Secure Xano authentication</span>
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
    </main>
  );
}
