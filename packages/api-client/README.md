# @rapex/api-client

The service layer every app's screens go through instead of holding hardcoded data. Built so that when the Xano API contract is available, **only this package changes** — no screen in any app should need to change.

## Architecture

```
core/            httpClient (generic fetch wrapper, interceptors, auth header injection), errors
repositories/    one folder per domain (auth, marketplace, orders, wallet, merchant, admin):
                   - <Domain>Repository.ts   -- interface, the real contract every implementation honors
                   - Mock<Domain>Repository.ts -- current implementation, in-memory mock data
                   - mockData.ts             -- the mock data itself
                   - types.ts (shared)       -- provisional UI-facing DTOs, NOT confirmed Xano entities
RepositoryProvider.tsx   React context that injects a `Repositories` object into the app
createMockRepositories.ts  factory returning all-Mock repositories -- what every app uses today
hooks/           useAsync/useAsyncAction (generic) + per-domain hooks (useCategories, useMyOrders, etc.)
                 that call `useRepositories()` and never touch mock data directly
```

## How screens use it

```tsx
const { data: stores, loading, error, refetch } = useFeaturedStores();

if (loading) return <Loading />;
if (error) return <ErrorState description={error} onRetry={refetch} />;
if (!stores?.length) return <EmptyState title="No stores yet" />;
return stores.map((store) => <StoreCard key={store.id} store={store} />);
```

No screen imports mock data directly, and no screen knows whether it's talking to a mock or to Xano.

## How to add the real Xano integration later

For each domain, once its endpoint contract is frozen:

1. Add `Xano<Domain>Repository.ts` implementing the same `<Domain>Repository` interface, calling `httpClient.request({...})` with the real path.
2. In each app's root (`providers/AppProviders.tsx` for RN apps, the equivalent composition root for web apps), swap that one repository from `Mock<Domain>Repository` to `Xano<Domain>Repository` in the object passed to `RepositoryProvider`.
3. Nothing else changes. Hooks, screens, loading/error states all stay identical — they were never coupled to which implementation was behind the interface.

## Status

Built: Auth, Marketplace, Orders, Wallet (wired into Customer App), Merchant, Admin (interfaces + mocks ready, not yet wired into screens since those apps don't have real content screens yet).

Explicitly out of scope for now: Rider, Provider, Community, Auction engine, Firebase.
