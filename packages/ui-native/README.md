# @rapex/ui-native

React Native component library for RAPEX's mobile-first apps: **Customer App** and **Rider App**. Built on `@rapex/theme` / `@rapex/constants` / `@rapex/utils`. Not built on React Native Web — `@rapex/ui-web` is the separate, web-native equivalent for the desktop-first portals.

## Built (atoms — foundational, composed into everything else)
`Button`, `Input`, `Badge`, `Avatar`, `GlassCard`, `Loading`, `Skeleton`, `EmptyState`, `ErrorState`, `Toast` (+ `ToastProvider`/`useToast`)

## Backlog (not built yet — composite/domain components, built as each screen that needs them gets implemented)
Search Bar, Rating, Bottom Sheet, Modal, QR Scanner Container, Category Card, Category Icon, Product Card, Product Grid, Store Card, Merchant Card, Voucher Card, Reward Card, Glass Header, Glass Wallet Card, Wallet Balance, Points Card, Referral Card, Revenue Card, Order Timeline, Timeline Step, Delivery Tracker, Floating R.E.X.

## Status
Foundational layer only. Composite cards build on top of these atoms (e.g. `ProductCard` will use `GlassCard` + `Badge` + `Button` internally) — building atoms first avoids rebuilding cards when a shared primitive changes.
