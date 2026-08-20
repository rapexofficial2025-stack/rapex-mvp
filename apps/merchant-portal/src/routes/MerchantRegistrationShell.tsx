import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

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
  const pageRef = useRef<HTMLElement>(null);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const page = pageRef.current;
    if (!page) return;

    page.style.setProperty("--merchant-cursor-x", `${event.clientX}px`);
    page.style.setProperty("--merchant-cursor-y", `${event.clientY}px`);
    page.dataset.cursorActive = event.target instanceof Element && event.target.closest(".merchant-registration-card") ? "false" : "true";
  }

  return (
    <main
      ref={pageRef}
      className="merchant-registration-page"
      data-cursor-active="false"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        if (pageRef.current) pageRef.current.dataset.cursorActive = "false";
      }}
    >
      <div className="merchant-registration-page__mesh" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-purple" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-orange" aria-hidden="true" />
      <div className="merchant-registration-page__glow is-blue" aria-hidden="true" />
      <div className="merchant-registration-cursor" aria-hidden="true">
        <img src={LOGO} alt="" />
      </div>

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
