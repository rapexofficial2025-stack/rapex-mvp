import type { ReactNode } from "react";

export type PortalDashboardTab = {
  key: string;
  label: string;
  onSelect: () => void;
};

export function PortalDashboardFrame({
  eyebrow,
  title,
  description,
  notice,
  tabs,
  activeTab,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  notice?: ReactNode;
  tabs: PortalDashboardTab[];
  activeTab: string;
  children: ReactNode;
}) {
  return (
    <div className="rapex-portal-dashboard">
      <header className="rapex-portal-dashboard__header">
        <div className="rapex-portal-dashboard__heading">
          <span className="rapex-portal-dashboard__eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {notice ? <div className="rapex-portal-dashboard__notice">{notice}</div> : null}
      </header>

      <nav className="rapex-portal-tabs" aria-label={`${title} sections`}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              className={active ? "rapex-portal-tab is-active" : "rapex-portal-tab"}
              aria-current={active ? "page" : undefined}
              onClick={tab.onSelect}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="rapex-portal-dashboard__content">{children}</div>
    </div>
  );
}

export function PortalPanel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={["rapex-portal-panel", className].filter(Boolean).join(" ")}>
      {title || subtitle || action ? (
        <div className="rapex-portal-panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action ? <div className="rapex-portal-panel__action">{action}</div> : null}
        </div>
      ) : null}
      <div className="rapex-portal-panel__body">{children}</div>
    </section>
  );
}

export function PortalMetric({
  label,
  value,
  detail,
  tone = "lavender",
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  tone?: "lavender" | "yellow" | "mint";
}) {
  return (
    <article className="rapex-portal-metric" data-tone={tone}>
      <span className="rapex-portal-metric__label">{label}</span>
      <strong className="rapex-portal-metric__value">{value}</strong>
      {detail ? <span className="rapex-portal-metric__detail">{detail}</span> : null}
    </article>
  );
}
