# PayMongo Integration (GCash / QR Ph)

## Status: client-side UX is real and built; the piece that actually charges a card/wallet is not, and cannot be, built in this repo.

The founder provided real PayMongo **test-mode** API keys directly in
chat on 2026-08-21 and asked for GCash + QR Ph to move from Beta into
Alpha. This doc records what that actually means, since "wire it now"
runs into one hard constraint: **a PayMongo secret key can only ever be
used from a server that keeps it private.** This repository is five
frontend apps (Vite web portals + Expo apps) with no server of its own --
Xano is the only backend RAPEX has. So:

- Everything the *frontend* can safely do is built: a real GCash/QR Ph
  option in `CheckoutScreen`, a `PaymentsRepository` architecture
  (`packages/api-client/src/repositories/payments/`), and a
  `PaymentCheckoutScreen` that walks through the full UX.
- The one piece that has to happen server-side -- actually calling
  PayMongo to create a charge -- is **not built**, because building it
  here would mean putting the secret key inside a public app bundle,
  which anyone could extract and use to make charges against the RAPEX
  PayMongo account. That's not a scope shortcut, it's a real security
  rule this project won't break regardless of how the timeline moved.

## What's real right now

- `PaymentMethodSelector` in `CheckoutScreen.tsx`: RAPEX Wallet, GCash,
  and QR Ph are all selectable. Maya and COD stay disabled (no keys/
  integration exist for either).
- Picking GCash/QR Ph and placing an order routes to
  `PaymentCheckoutScreen`, which is an **honest in-app simulator** --
  two buttons ("Simulate Successful Payment" / "Simulate Failed
  Payment") stand in for what would normally be PayMongo's hosted
  checkout page + webhook callback. Clearly labeled as simulated, not a
  real charge.
- `packages/api-client/src/repositories/payments/`: `PaymentsRepository`
  interface, `MockPaymentsRepository` (the simulator's backing store),
  `XanoPaymentsRepository` (delegates to Mock today, documents the exact
  contract needed -- see its doc comment, mirrored below).
- The PayMongo **public** key (`pk_test_...`, safe client-side) is stored
  in each app's env config, ready for when a real client-side PayMongo
  SDK call is needed (e.g. card tokenization, if that's ever added).
  The **secret** key (`sk_test_...`) is not stored anywhere in this repo
  and never will be -- see "What a Xano developer needs to build" below
  for where it actually belongs.

## What a Xano developer needs to build

Two endpoints, using the PayMongo secret key stored as a **Xano
environment variable** (Settings inside the Xano workspace, not
hardcoded in any function) -- the founder already has this key from the
same conversation that produced this doc.

### `POST /payments/paymongo/checkout`

Request body: `{ method: "gcash" | "qrph", amount: number (PHP), order_id: string }`

Server-side, call PayMongo's Sources API:

```
POST https://api.paymongo.com/v1/sources
Authorization: Basic base64(<secret_key>:)
Content-Type: application/json

{
  "data": {
    "attributes": {
      "amount": <amount * 100>,          // PayMongo wants centavos
      "currency": "PHP",
      "type": "<method>",                // "gcash" or "qrph"
      "redirect": {
        "success": "<app deep link, e.g. rapex://payment-result?ref={id}&status=paid>",
        "failed": "<app deep link, e.g. rapex://payment-result?ref={id}&status=failed>"
      }
    }
  }
}
```

Response to the app: `{ reference_id: <PayMongo source id>, checkout_url: <redirect.checkout_url from PayMongo's response>, status: "pending" }`

### `GET /payments/paymongo/status/{reference_id}`

Either poll PayMongo's `GET /sources/{id}` directly, or (preferred)
receive a PayMongo webhook on payment completion and store the result in
a Xano table, then have this endpoint just read that row. Webhooks need
their own signing secret (also a Xano env var, also never returned to
the client) to verify the request actually came from PayMongo.

Response to the app: `{ status: "pending" | "paid" | "failed" }`

## Once that endpoint exists

Swap `XanoPaymentsRepository`'s two methods from delegating to
`MockPaymentsRepository` over to real `client.request(...)` calls against
the endpoints above -- no changes needed anywhere else (`CheckoutScreen`,
`PaymentCheckoutScreen`, and the `PaymentsRepository` interface all stay
the same, per this codebase's Mock/Xano swap convention throughout
`packages/api-client`).
