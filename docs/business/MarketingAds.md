# Marketing Ads

Business rules for the Admin-controlled promotional/advertising system.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-18 as a planning/spec document — review only, no implementation
started from this doc yet.

## Admin Ads Engine
Admin gets a dedicated **Marketing / Ads** tab. Admin can create
promotional campaigns and upload visual assets.

## Supported visual assets (Marketing Asset Bank)
Poster, Header 1, Header 2, Banner, Icon, Image, GIF, MP4/video, other
approved promotional media. Each asset has its own metadata and
active/expiry status.

## Where ads can appear
Admin chooses placement — e.g. Welcome Screen (`Welcome → [ PROMOTIONAL
POSTER ] → Continue`), Cart/Express Cart (`Items → [ PROMO POSTER ] →
Checkout`), or other approved app surfaces. The same campaign can appear
in multiple locations, and the system should be able to **randomize**
eligible ads so users don't always see the exact same poster.

## Ad interaction
Customer taps the poster → opens a Promotion/Ad View → `Close` → returns
to the **previous screen** (e.g. opened from Cart → Close returns to
Cart). The ad must never destroy or reset the user's current navigation
state.

## Expiration
Every campaign has a Start date and an Expires date + Status (e.g.
"Back-to-School Promo", Start Aug 20 2026, Expires Sep 05 2026, Status
ACTIVE). After expiration, the campaign automatically goes inactive and
is no longer served.

## Audience targeting
Admin defines the intended audience per campaign via checkboxes —
Customer / Rider / Merchant, any combination (e.g. Customer-only, or
Customer+Rider+Merchant). This lets one campaign target only the
appropriate app/user group.

## RAPEX Visual Asset Bank
A centralized asset bank rather than scattering promotional files across
apps:
```
RAPEX ASSET BANK
├── Images (Posters, Headers, Banners, Icons, ...)
├── GIFs
└── Video (MP4)
```
Media files are stored in **Firebase Storage**; the system/database
stores metadata and references only (see `MARKETING ADS` table in
`docs/database/data-dictionary.md` and the general `MEDIA / ASSET BANK`
table — this is the RAPEX-facing layer on top of that).

## Xano rule (same as everywhere else)
Inspect existing tables/APIs first. If one already performs the same/
similar function, update/extend it — never duplicate or delete an
existing API. Use Xano's native `id` internally and `rapid_code` for
RAPEX-facing identifiers.
