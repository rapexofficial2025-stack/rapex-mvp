# Freelancer Professional Service (prototype)

Standalone prototype app for testing the **registration** and **find-a-service / booking**
flows across the three RAPEX roles -- Rider, Customer, Merchant -- without needing a real
backend. Not a production app: all data lives in `localStorage` on the device running it.

- **Platform:** React + Vite + TypeScript + `react-router-dom`
- **Shared packages:** `@rapex/theme`, `@rapex/ui-web`, `@rapex/types`, `@rapex/constants`, `@rapex/utils`
- **Backend:** none -- registration and bookings are mocked in `src/lib/store.ts`

## Flow

1. **Landing screen** (`/`) -- three role icons: Rider, Customer, Merchant.
2. Picking a role opens its **role screen** (`/role/:role`) with two actions:
   - **Register as Freelancer** (`/role/:role/register`) -- a short form that adds a profile
     to the shared freelancer directory.
   - **Find Service** (`/role/:role/find-service`) -- browse every registered freelancer
     (across all three roles) and book one.
3. Every screen cross-links to the others, and the freelancer directory / booking list is
   shared (via `localStorage`), so a profile registered from the Rider screen is immediately
   bookable from the Customer or Merchant screen -- that's the "can view each other once
   registered" part of the prototype.

## Run it

From the repo root:

```bash
pnpm --filter freelancer-app dev
```

## Status

Prototype for manual click-through testing of the registration + booking loop. Business
logic is intentionally mocked client-side (see `src/lib/store.ts`) -- a real implementation
would move this to Xano, per [../../docs/00_PROJECT_OVERVIEW.md](../../docs/00_PROJECT_OVERVIEW.md).
