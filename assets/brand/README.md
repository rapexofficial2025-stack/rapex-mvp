# assets/brand/

RAPEX brand identity assets, shared across every app. This is the single source of truth for the logo — no app should keep its own copy of these files or fall back to a framework-default icon (Vite/Expo placeholders).

## Expected files

Drop the following exports into this folder using these exact names. Once present, every app wires up automatically (see "Where each asset is used" below).

| File | Source | Description |
|---|---|---|
| `rapex-app-icon.png` | Image 1 | Full lockup (icon + wordmark + tagline) inside the rounded chrome app-icon frame. Used as the literal app icon everywhere an OS/browser needs one. |
| `rapex-icon.png` | Image 2 | The bird/swoosh mark alone, transparent background. Used for compact placements — sidebar corner, loading screens. |
| `rapex-wordmark.png` | Image 3 | "RAPEX" wordmark + tagline, no icon, transparent background. Used frameless, or as a soft low-opacity watermark. |
| `rapex-lockup.png` | Image 4 | Icon stacked above the wordmark, transparent background. The flagship lockup — used for marketing/header placements with more room to breathe. |

Recommended: also drop SVG versions if available (`rapex-icon.svg`, `rapex-wordmark.svg`, `rapex-lockup.svg`) — vector scales cleanly for favicons and high-DPI screens where the PNG might blur. PNG works fine everywhere else.

## Where each asset is used

- **App icon** (`rapex-app-icon.png`, the framed chrome lockup) — overwrites `apps/customer-app/assets/icon.png` and `apps/rider-app/assets/icon.png` (Expo app icon, 1024x1024, same filename/path already wired in each `app.json` — no config change needed, just replace the file).
- **Icon alone** (`rapex-icon.png`, transparent) — browser favicons for the three Vite web apps (copied into each app's `public/favicon.png`), Expo web favicons (`apps/customer-app/assets/favicon.png`, `apps/rider-app/assets/favicon.png`), the `Sidebar` top-left brand mark (admin-portal, merchant-portal), and the shared `Loading` component's mark (`packages/ui-web`, `packages/ui-native`). Small/compact contexts where the full lockup would be illegible.
- **Wordmark alone** (`rapex-wordmark.png`) — `Topbar` low-opacity background watermark (`packages/ui-web`).
- **Lockup** (`rapex-lockup.png`, icon above wordmark) — Merchant onboarding wizard header, and other marketing-style entry moments, placed wherever it fits.

Android adaptive icon layers (`android-icon-foreground.png`/`-background.png`/`-monochrome.png`) are a separate, more involved export (foreground needs to be icon-only on a transparent safe zone) — out of scope for this pass, flagged as a follow-up once the base assets are in.

## Status
Folder created 2026-08-02, waiting on the actual files — Claude Code cannot save pasted/attached images to disk directly, only read files that already exist on disk. Once dropped here (or their real paths given), the next turn wires everything in and verifies in-browser.
