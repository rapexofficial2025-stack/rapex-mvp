# @rapex/types

Shared TypeScript types used across RAPEX apps.

## What's here
- `common.ts` — generic utility types (`ID`, `ISODateString`, `Nullable<T>`, `Paginated<T>`)
- `api.ts` — provisional API response envelope (`ApiResult<T>`)

## What's deliberately missing
Domain entity types — `User`, `Order`, `Product`, `Wallet`, `Auction`, etc. — are not defined yet. They need to match the real Xano API contract field-for-field; defining them now would mean guessing, and guessing here means every app built against them needs rework later. They get added the moment the Auth (and later, other) endpoint contracts are provided. See [../../docs/api/README.md](../../docs/api/README.md).
