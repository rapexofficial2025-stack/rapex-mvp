# RAPEX Web Codex Handoff Summary

## Purpose

This document preserves the **product, workflow, and UI/UX intent** of the legacy RAPEX web portals created in the `rapex-mvp` workspace. It is a rebuild reference for Jed's Django + Next.js + Expo stack, not a request to copy legacy React/Vite code or old Xano adapters.

The migration rule is simple: preserve the experience and the security boundaries, but let Django own data, permissions, calculations, audit trails, and state transitions.

## Scope and status

| Portal | Legacy Codex scope | Migration status |
| --- | --- | --- |
| Admin Portal | Extensive UI/UX skeletons, monitoring, governance, operational, Super Admin, receipt/export, and map experiences | Rebuild against Django permissions and API contracts |
| Merchant Portal | Authentication/onboarding, store, listing, product, orders, wallet, voucher, receipts, and print/export experiences | Rebuild against merchant-scoped Django APIs |
| Provider Portal | Starter shell only; no business workflow was built | Product discovery and implementation still required |

All dashboard values, map positions, activity feeds, status labels, and entities without a confirmed backend contract were intentionally shown as **mock, preview, placeholder, or API-required**. They must never be presented as live production results.

## Product principles that must survive the migration

1. **Backend owns business truth.** Prices, balances, fees, commissions, eligibility, order transitions, risk signals, approval decisions, and permissions are calculated and enforced by the server.
2. **No fabricated success.** A UI may preview an action, but it must not claim that OTP verification, KYC, payment, approval, export, status change, or data save succeeded without a successful API response.
3. **One identity foundation, role-specific profiles.** Customer, rider, merchant, admin, and Super Admin must share a secure account identity while keeping their workflows and permissions separate.
4. **Server-side ownership checks.** A merchant can only see and change its own stores/listings/orders. An Admin only sees modules allowed by their granted role. Super Admin is a server-verified step-up capability, never a frontend switch.
5. **Simple Alpha onboarding.** Registration is easy; extra verification is conditional on the role and the product capability being activated.
6. **Honest operational states.** Loading, empty, offline, contract-required, error, and permission-denied states are useful product states, not failures to hide.

## Shared visual and interaction system

The intended design language is a premium, readable, dark operational console—not a colorful or emoji-heavy dashboard.

| Area | Convention and reason |
| --- | --- |
| Surface | Dark navy/charcoal base with restrained frosted-glass panels, soft blur, translucent borders, and depth shadows. This gives RAPEX a premium command-center feel without reducing readability. |
| Accent | Purple/magenta with a small orange highlight at borders, focus points, and primary actions. Avoid filling the whole screen with gradients or solid bright colors. |
| Status | Prefer a thin colored border, dot, label, or outlined chip. Do not turn every status into a large bright block. |
| Buttons | One clear primary action per screen; no more than three secondary actions in the same decision area. Primary buttons may have subtle press/scale feedback; normal buttons remain calm. |
| Navigation | Text labels are always visible; no icon-only critical navigation. Sidebar groups are collapsible, titles have subtle hover motion/highlight, and sub-items retain a clear selected state. |
| Motion | Route/content changes use short, subtle fades/slides. Cursor glow and glass highlights are restrained and respect reduced-motion preferences. No aggressive flashing. |
| Data density | Tables, filters, grouped cards, and contextual side panels are preferred for operations. Spacing and typography follow a warehouse/ERP-style hierarchy rather than a consumer-game aesthetic. |
| Accessibility | Inputs require labels, controls require meaningful text, focus state remains visible, color is never the only status indicator, and keyboard navigation must work. |
| Responsiveness | Desktop has a persistent sidebar. On narrow screens, navigation becomes a drawer and secondary rails can collapse below primary content. |

The new Next.js implementation should turn these into shared tokens/components so Admin and Merchant feel like one RAPEX system while retaining role-specific navigation.

## Shared preview and navigation behavior

Legacy portals included preview routes so the founder could inspect navigation without real credentials. Those routes are **not authentication bypasses** and must not be treated as production access.

- Admin production routes are under `/admin`; preview routes were under `/admin/preview`.
- Merchant production routes are under `/portal`; preview routes were under `/portal/preview`.
- Preview mode may show representative data but must label it as preview/mock/API-required.
- A destination without a completed data contract should show a useful shell or explanation instead of a dead button.
- Real routes must use server authentication and authorization in the new stack.

## Admin Portal

### Admin authentication and security

The Admin login is a polished glass-card experience with the RAPEX command-center brand. It is intentionally separate from registration and should contain only:

- Email/mobile or approved username entry, password, sign-in, forgot-password, and optional Google sign-in.
- A clear statement that normal Admin access is invitation-only. There must be no public "Create Admin Account" flow.
- Password reset flow: identify account, send email/OTP through the backend, verify code, set and confirm a new password, then return to login.
- Admin invitation flow: an authorized Admin/Super Admin creates an invitation; the invited person creates credentials, verifies email/mobile, receives role assignment, then becomes active only after server approval.

Future security requirements remain part of the product: MFA/OTP, session expiry, device/session records, login history, failed-login monitoring, IP/security logs, suspension, and immutable audit logs.

### Admin application shell

The Admin shell is a dark glass operational workspace with a top bar, collapsible sidebar, route transitions, search, notification/profile controls, and print-current-view entry point.

Sidebar groups were designed around these business areas:

| Group | Purpose |
| --- | --- |
| Dashboard | Executive overview and prioritized actions |
| Users | User management, registrations, age engine, locations, communities, merchants |
| Orders | Orders and financial settlement views |
| Delivery | Live map, active deliveries, rider management |
| Products / Marketplace | Categories, products, images, variants, options, inventory, services, auctions |
| Operations / System | Engines, integrations, settings, error center, audit/export/receipt controls |
| Super Admin | One locked, collapsible group for privileged modules only |

The Super Admin group must remain hidden or locked until the backend confirms a successful time-limited step-up. An ordinary Admin can see that protected capabilities exist, but cannot access or infer protected data.

### Executive dashboard

The dashboard is an operational overview, not a ledger of invented figures. It includes:

- KPI cards for revenue, orders, completion/pending counts, online riders/stores, and attention items.
- Revenue/chart, distribution, and operational-map regions with hover/focus interaction.
- Recent orders, pending approvals, system readiness, activity feed, quick actions, and expiring memberships.
- Chart hover animation and donut/graph emphasis are subtle visual feedback only; the source values must be backend data.

Quick actions should route to the relevant approval, voucher, notification, promotion, or map workflow; they must not mutate records without confirmation and authorization.

### Live Operations / Command Center / Live Map

The operations command center is the Admin's live situational-awareness screen. The legacy UI specifically preserved these requirements:

- Dark Google Maps presentation when a securely configured Maps key is available; a clearly labeled non-live fallback must appear when it is not.
- Rider and merchant markers with click detail cards. Rider details include availability/status, mobile number, vehicle/model, plate/license where appropriate, and combined location. Merchant details include store logo/photo and combined address/location.
- Filters for municipality, barangay, highest transaction priority, entity type (riders/merchants), listing category, and operational status.
- Supporting KPI strip, live activity feed, map-access settings, and operational attention queue.
- Geo-fence UI is for defining/visualizing an area only. Radius persistence, rule enforcement, notifications, and rider/location privacy are backend responsibilities.

Map marker coordinates and feed items in the legacy preview are not evidence of live tracking. The new system must use a secure map key via environment configuration, server-authorized data, and real-time transport chosen by Jed's stack. Never commit Google Maps keys.

### User management and risk review

The User Management screen was designed as a searchable, filterable table for customers, merchants, riders, providers, and Admin accounts. It supports role, status, location, and availability filtering plus profile/detail navigation.

Important risk rule: suspicious/spam/scam indicators are **manual-review cues**, never automatic proof of fraud. Device model, MAC/device identifiers, transaction history, and remarks are sensitive data. Any future risk view must:

- Collect only legally approved identifiers and never expose raw device data broadly.
- Explain the reason for a flag and retain an auditable human decision.
- Use role-based access, retention limits, and backend-controlled suspension/review actions.
- Never accuse a customer or rider based only on a frontend label.

### Registration Monitor and verification queue

Registration Monitor summarizes where applicants are in onboarding and which requirements are missing. It is primarily read-only until a verified contract permits an action.

Verification Queue is the human-review screen for merchant, rider, and provider submissions. It shows applicant identity/profile, contact channels, identity/selfie evidence, store or vehicle information, and requested documents. The alpha decision model is deliberately simple:

- Approve
- Reject
- Request correction

Each decision must be server-authorized, require a reason where policy requires it, create an audit entry, and notify the applicant. Small merchants should not be blocked by business-permit requirements during basic Alpha registration; documents become conditional based on activated capabilities.

### Merchant, rider, store, product, and inventory monitoring

These Admin areas share a dense operational table/card pattern with filters, status chips, detail drawers, and empty/error/loading states.

| Area | What it is for | Rule |
| --- | --- | --- |
| Merchant Management | Search merchants/stores, approval status, operational state, and performance context | Suspension/reinstatement is audited and server-authorized |
| Rider Management | Rider availability, active delivery context, vehicle/identity review, and escalation | Availability and assignment states come from the delivery engine |
| Product Monitoring | Cross-store product catalog review with search, store/category/status filters, pagination, and review/unavailable states | Product status changes must be auditable and must not rewrite merchant data silently |
| Product Images / Variants / Options | Inspection surfaces for catalog structure | Never invent catalog structure or availability from the UI |
| Inventory | Stock review and exception monitoring | Stock ownership and adjustments are server controlled |
| Orders / Delivery | Global order table, status/timeline, merchant/customer/rider/payout context | Valid state transitions must come from the backend state machine |
| Locations / Communities | Province, municipality, barangay, and community master data | Location data is a shared authoritative master-data domain |
| Age Engine | Read-only result/eligibility view | Age and eligibility calculations are authoritative backend rules |

Several legacy screens were intentionally API-required shells rather than finished data screens. Recreate their loading/empty/contract states first, then wire them only when Django serializers and permissions are defined.

### Category engine and listing taxonomy

The Category Engine supports a future-safe marketplace taxonomy. It deliberately separates:

- Main category
- Subcategory
- Store category
- Product category
- Tags and variants
- Image/animation preview uploads such as PNG or GIF

The Admin flow allows choosing the category level, selecting a parent where required, entering label/description/sort order/status, previewing assets, and managing tags/variants. It exists so category creation is understandable before the backend is wired.

Deletion must be a controlled backend operation: do not silently delete a category that is referenced by stores, products, orders, reports, or historical receipts. Prefer disable/archive, dependency disclosure, confirmation, and audit history.

### Pricing, engines, order financials, and operational settings

Engine Center is an organized shell for marketplace, delivery, pricing, promotions, finance, membership, rewards, wallet, coverage, verification, orders, notifications, maps, and developer controls. It communicates that changing an engine is a high-impact, auditable action.

Order Financials presents the explanation of an order settlement: distance/delivery fee, merchant proceeds, platform commission/revenue, rider earnings, wallet deductions, payment reference, and event timeline. All amounts and formulas must be calculated by the server.

Operational Settings are for lower-risk daily configurations such as delivery types, vehicle types, notification templates, voucher settings, and allowed categories. Credentials, infrastructure controls, financial overrides, and destructive platform changes belong to restricted Super Admin/API controls.

### Error Center, audit logs, integrations, and notifications

Error Center is a premium read-only incident workspace. Its expected fields are error ID, severity (critical/warning/info), application, module/endpoint, safe client detail, occurrence count, first/last seen, and lifecycle state (open/acknowledged/resolved).

Errors must be redacted server-side. Screens must never expose secrets, tokens, raw request bodies, or private customer data. Acknowledging, assigning, retrying, or resolving an incident requires a confirmed API action plus audit logging.

Integrations displays readiness/status for Xano/Django-era APIs, Firebase/push, Google Maps, PayMongo, email/SMS, and other services. It must not reveal secrets or falsely claim a dependency is live.

Admin notification/broadcast UI routes to a backend-controlled push/email/SMS service. It needs audience selection, preview, permission checks, rate limiting, and audit trail.

### Receipts, printing, and secure export

The receipt experience was designed for digital order records, printing, and future official-receipt issuance:

- Receipt history contains no fabricated transactions; it must have honest empty/loading/error states.
- A printable receipt preview can show store/logo, buyer, item lines, payment and delivery settlement, commission, VAT/non-VAT treatment, QR verification reference, and order/invoice identifiers when the backend provides them.
- It must not call itself a BIR Official Receipt until the legal receipt number, tax fields, issuer details, and issuance workflow are generated by the backend.
- Browser print and optional portable/ESC-POS printing are client conveniences. Device support varies; portable printer capability must be detected and explained.
- Epson LQ-310/paper forms need an explicitly tested print stylesheet/template. Do not assume a normal browser layout will fit dot-matrix paper.

Admin Receipt Design is a template/configuration workspace. Any change to legal/tax receipt layout needs permission control, version history, approval, and backend issuance compatibility.

Secure Export Center is reserved for sensitive data exports. A real export should require Super Admin elevation/PIN or equivalent step-up, submit a server-side asynchronous job, create an auditable/expiring download, and enforce row-level permissions. CSV/PDF/JPEG/Google Sheets export must never dump raw private data from the browser.

### Super Admin experience

Super Admin is a security product, not a cosmetic role toggle.

- The access page accepts a security-key/step-up challenge only through a secure server flow. It must not store the secret in browser storage.
- After verification, the server returns time-limited capabilities/modules/actions. The client reflects those capabilities; it never grants them.
- All elevation attempts, privileged reads, changes, exports, impersonation-like workflows, and recovery actions require immutable audit trails.
- Super Admin modules include Admin Accounts, Users/Roles, Stores/Merchants, Catalog, Engines, Audit/Recovery, and other privileged controls. Each must remain locked/hidden until real capability data arrives.
- Bank-wallet/private password values remain out of view even for broad administrative access unless a separately approved, lawful workflow exists.

## Merchant Portal

### Merchant authentication

Merchant login uses the same premium glass language as Admin while clearly identifying the Merchant Portal. The normal entry screen contains email/mobile, password, forgot password, create account, and Google sign-in where configured.

Authentication must route based on the backend-returned role/capability and session—not by matching a hardcoded username in the frontend. Google authentication, OTP, and password reset must only transition after server confirmation.

### Merchant registration and Alpha approval flow

Registration was intentionally moved away from the login view into a separate centered glass-card wizard with progress at the top, dark background, and subtle neon/cursor atmosphere. The compressed five-stage flow is:

1. **Account** — first/last name, email, mobile, password, confirmation.
2. **Verify** — email OTP and mobile OTP.
3. **Basic identity** — birthday, gender, optional profile photo, address, identity type/number, front/back, and selfie where required.
4. **Main store** — store name, category/subcategory, logo/cover, description, contact number, operating hours, and location.
5. **Review and submit** — consent, review, submission state, and next steps.

The intended Alpha status chain is: merchant registered → verified → store created → Admin review → approved → store active. Business permits are conditional later for capabilities such as POS, wholesale, supplier purchasing, or higher transaction limits; they are not a blanket Alpha blocker for small stores.

The UI may validate password match/strength and completion, but OTP/KYC/approval status must always come from the backend.

### Merchant shell and store context

The Merchant portal uses the same dark glass design system, but a calmer business-operator navigation. It includes a store selector, top controls, compact search, theme/print/profile access, and collapsible navigation.

Core navigation concepts:

| Area | Purpose |
| --- | --- |
| Overview | Merchant and selected-store health, checklist, insights, and next action |
| Store Management | Main store, multiple stores/branches, profile, coverage, operating hours |
| Listings | Create listing and type-specific Product, Service, Auction, and Pre-Loved workflows |
| Operations | Orders, receipt history, delivery context, availability |
| Finance & Growth | Wallet, payouts, vouchers, promotions, analytics |
| Account & Capabilities | Merchant capability applications, profile, security, help |

All store-specific data must be scoped by selected store and validated server-side. A merchant may own multiple stores/branches, but never access another merchant's store simply by changing an ID.

### Merchant dashboard and store page

The merchant dashboard/store experience was designed as a store-aware operating home:

- Store identity/status and profile/settings actions.
- Onboarding/checklist reminders and approval/capability state.
- Product/listing overview, order/financial insight summaries, timeline/activity, nearby-rider/coverage/map placeholders, and expansion prompts.
- Preview modals and explanatory states where APIs were not yet confirmed.

The selected store is the context for product, order, financial, and performance views. A branch can be a store under the same merchant account, potentially with a different category/location/hours, but activation remains backend/approval controlled.

### Listing types and capability foundation

One RAPEX account can eventually activate multiple capabilities: store merchant, freelancer, provider company, rider, auction seller, and buyer roles. The merchant web UI therefore starts by asking **what is being listed** rather than forcing every listing through one giant form:

- Product
- Service
- Auction
- Pre-Loved

Each type has separate data, rules, and approval/capability needs. Product flow is the most developed; Service/Auction/Pre-Loved are intentionally contract-required when their backend models are absent. This separation prevents wrong fields, wrong validation, and incorrect pricing/fulfillment logic.

### Product setup and catalog management

The Add Product flow was shaped for fast, practical merchant use, including a mobile-friendly, GCash-like simplification:

- Choose category, add/capture photo, name product, set price, set quantity/stock, then save/continue.
- Batch entry may retain category/name/photo for the next product while price and quantity clear after each entry.
- Product list includes empty/loading/error states, search/filter intent, and status visibility.
- Photo upload preview is allowed, but upload/storage success is backend-owned.
- Bulk import can guide CSV/Google Sheet preparation using expected columns such as `name`, `price`, `category`, and `stock`; validation/import results must come from the server.

Variants, options, inventory, and media must use a backend-defined product schema. The browser must not invent stock counts or claim an image is stored when it is only locally previewed.

### Merchant orders and delivery workflow

Merchant Orders provides list/detail treatment, customer/order context, status/timeline display, and action areas for accepting, preparing, and marking an order ready when the backend permits it.

Order state transitions must be constrained by a shared backend state machine. For example, a merchant cannot mark an unknown or cancelled order as ready, and a UI click cannot become a fake completed order. Delivery/rider information is readable only as permitted for the merchant's own order.

### Wallet, payouts, promotions, and vouchers

Wallet views communicate available balance, transaction history, payout status, and bank/payout context. Balances, holds, fees, and payout eligibility are server-authoritative and must never be calculated in a component.

Voucher creation is a simple merchant-facing workflow: code, discount type (percentage/fixed/free delivery), amount, minimum order, usage limit, expiry, store scope, and lifecycle/status. It must validate through the backend, enforce ownership, and avoid simulated publication.

Promotions and growth features follow the same model: clear eligibility, preview where useful, backend validation, approval where required, and honest state.

### Merchant receipts, printing, and export

Merchant Receipt History and receipt preview follow the same legal honesty as Admin. A merchant can print an order record, but an official tax receipt requires server issuance and legal/tax data.

Merchant export/print capability is allowed, but sensitive exports remain restricted by merchant ownership, permission, secure job generation, audit history, and any necessary elevation. Printing must work through a clear browser print path and can optionally use supported portable printer capability without assuming all hardware works.

### Merchant onboarding details

Legacy onboarding included business category/nature, store details, KYC, optional/conditional documents, initial products, visual appearance, and completion celebration. The new system should decide whether onboarding is backed by a secure draft model or an atomic submission model; either choice must preserve resumability and never expose incomplete private documents to unauthorized users.

## Provider Portal

Provider Portal was explicitly outside the original Codex scope. Its current legacy state is a **starter shell only**:

- RAPEX Provider Portal title/tagline.
- Theme toggle/basic visual shell.
- No authentication, navigation, onboarding, service listing, booking management, availability, provider dashboard, map, payment, receipt, print, or API workflow.

It should not be described as complete. Future Provider work should reuse the shared RAPEX visual tokens but needs separate product discovery for service-provider verification, service catalog, availability, booking/order lifecycle, payouts, customer communication, and cancellation/dispute rules.

## Legacy route inventory

The following expresses the legacy UI information architecture. It is not a requirement to mirror exact URL names in Next.js, but the destinations and role boundaries should remain understandable.

| Portal | Destinations covered |
| --- | --- |
| Admin | Login/invite/reset, Dashboard, Command Center/Live Map, Verification Queue, Engine Center, Order Financials, Integrations, Users, Registration Monitor, Age Engine, Locations, Communities, Merchants, Categories, Service Categories/Providers, Product Images/Variants/Options/Inventory, Orders, Delivery, Riders, Error Center, Settings, Profile, Receipt Design, Secure Exports, and locked Super Admin modules |
| Merchant | Login/register/reset, dashboard, store/branch context, listing-type selection, add product/catalog, orders, wallet, vouchers, receipts/print/export, onboarding, capability center, profile/settings, and planned service/auction/pre-loved paths |
| Provider | Starter placeholder only |

## Migration requirements for Jed's Django + Next.js + Expo stack

1. Rebuild product behavior with Next.js routes/components and Django APIs; do not copy legacy Vite components or repository interfaces blindly.
2. Establish Django identity, roles, capabilities, invitations, sessions, MFA/step-up, and row-level object ownership before enabling sensitive routes.
3. Define serializers/contracts before enabling a screen's mutation. Preserve semantic fields from the legacy reference only when they make sense for the new domain model.
4. Recreate every pending state: loading, no data, failed request, unauthorized, unavailable capability, confirmation, and completed server response.
5. Use secure environment variables for Maps, payments, OAuth, push, email, and storage. Never hardcode keys, credentials, tokens, presigned URLs, or Super Admin secrets.
6. Build real-time map/delivery only after privacy policy, rider consent, data minimization, and server subscription authorization are implemented.
7. Treat receipts, QR payments, wallet balances, payout data, financial exports, and tax fields as regulated/authoritative server output.
8. Preserve the dark premium glass system as a reusable design system, with accessible light mode where required, not as duplicated per-screen CSS.
9. Verify mobile, desktop, keyboard, screen-reader labels, empty/error/offline behavior, print layouts, and no-fake-success behavior before production.

## Known legacy limitations to carry forward honestly

| Area | Legacy position | New-stack action |
| --- | --- | --- |
| Maps | Visual integration and dark map UX existed; live source/key/real-time data were not production-proven | Build a secured map service and authenticated real-time API |
| Admin data modules | Many were polished shells or mock repositories awaiting contracts | Prioritize contracts then wire table/detail/mutation flows |
| Merchant non-product listing types | UX foundation exists; contracts were incomplete | Model each listing type separately in Django |
| Payments / QR | UI and intended PayMongo QR flow were referenced, but no frontend success may be assumed | Implement payment intents/webhooks/server verification before exposing completion |
| Google auth / OTP | UI and integration intent existed | Implement server token verification and role routing |
| Export / printing | UI/print concepts exist | Build authorization, job queue, audit, signed download, legal templates, device testing |
| Provider Portal | Only starter UI | Scope and build as a new product area |

## Final handoff instruction

This is the final Web Codex deliverable for the legacy `rapex-mvp` path. Treat it as a product specification and UX reference. The active implementation work now belongs in Jed's stack after this document has been reviewed and mapped to Django models, APIs, Next.js routes, and Expo/mobile responsibilities.
