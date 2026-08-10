# 09 — Roadmap

**MVP target date:** 2026-09-01

## Build order
1. ✅ Architecture outline + repo/folder skeleton (PR #1)
2. ⬜ Finalize enterprise architecture (in review — PR #1 stays open until approved)
3. ⬜ Xano backend design: database schema, API endpoints, auth flow, wallet/order/auction/referral/rewards engines, Market Shopper/merchant/rider/provider/admin workflows
4. ⬜ `packages/api-client` + `packages/types` built against the finalized Xano API contract
5. ⬜ Navigation setup per app
6. ⬜ Import Base44 UI into `apps/*/src/components` and `screens`
7. ⬜ Authentication (Login Module, shared across apps)
8. ⬜ Core marketplace + delivery flows (Customer App, Rider App)
9. ⬜ Merchant Portal, Provider Portal
10. ⬜ Admin Portal
11. ⬜ Wallet + payments (PayMongo, QRPH, GCash, Maya)
12. ⬜ Testing pass across all apps

## Pilot launch target
Imus, Kawit, Lancaster, General Trias.

## Explicitly out of scope for this repo
`analytics/`, `crm/`, `erp/`, `marketing/`, `finance/`, `hr/` are possible future systems for the business, but are not part of the `rapex-mvp` codebase. Noted here only so the idea isn't lost, not tracked as folders or tasks in this repo.

## Status
Step 1 done. Step 2 (this architecture review) in progress. Step 3 (Xano) is the next real conversation once step 2 is approved and PR #1 merges.
