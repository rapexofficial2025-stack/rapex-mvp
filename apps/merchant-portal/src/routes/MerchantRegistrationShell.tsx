import type { ReactNode } from "react";

const LOGO = new URL("../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;

export function MerchantRegistrationShell({
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
    <main className="merchant-registration-page">
      <div className="merchant-registration-page__mesh" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-purple" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-orange" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-blue" aria-hidden="true" />

      <section className="merchant-registration-card" aria-label="RAPEX Merchant registration">
        <header className="merchant-registration-card__header">
          <img className="merchant-registration-card__logo" src={LOGO} alt="RAPEX" />
          <div>
            <span className="merchant-auth__eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="merchant-auth__description">{description}</p>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
