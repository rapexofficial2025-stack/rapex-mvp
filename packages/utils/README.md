# @rapex/utils

Shared pure helper functions used across RAPEX apps — no business logic, no network calls, no platform-specific dependencies.

- `validation.ts` — email, PH mobile number, password strength, non-empty checks
- `date.ts` — date/datetime/relative-time formatting (en-PH locale)
- `currency.ts` — peso formatting, centavos↔pesos conversion
- `location.ts` — Haversine distance, distance formatting
- `image.ts` — aspect ratio, filename/extension checks, file size formatting (no image processing library — that's platform-specific and lives per-app)
- `role.ts`, `permissions.ts` — role-label lookup and role-gate checks, built on `@rapex/constants`. The actual permission matrix (who can do what) is a business rule defined later in `docs/business/`.
