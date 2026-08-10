# Auction

## Status
**Received, not independently verified.** From a 2026-08-04 ChatGPT
business-rules planning session (exported and handed to Claude 2026-08-10),
described there as the canonical auction spec. That source listed Auction
among features held back for a staged Alpha rollout — **Founder decision
(2026-08-10): the staged Alpha concept is cancelled**, RAPEX deploys the
full feature set together (see `Rewards.md`'s matching update), so Auction
is in scope, not deferred. The Customer App already has navigable Auction
screens (`AuctionHomeScreen`, `AuctionDetailsScreen`, `AuctionProfileScreen`)
— they're currently UI shells only, not wired to any of the mechanics below;
wiring them up is real work still to be scheduled, not a launch blocker by
itself.

## Creating an auction
Seller provides: Title, Description, Photos, Category, Starting Price,
Reserve Price (optional), Buy Now Price (optional), Auction Duration, Bid
Increment, Shipping Method, Pickup Option → Publish.

## Buyer flow
Browse → Open Auction → view Current Bid / Highest Bid / Time Remaining / Bid
History / Seller Rating → Place Bid.

## Bid rules
A bid must exceed Current Bid + Minimum Increment, or it's rejected. When a
new bid is placed, the previous highest bidder's reserved wallet funds are
released and the new highest bidder's funds get reserved instead — this
prevents double-locking funds across multiple simultaneous bidders.

## Auction end
Timer reaches 0 → system checks the highest bid → winner determined → escrow
remains reserved → seller notified.

## Winner flow
Winner gets a "Congratulations! You won this auction" notification, funds
remain reserved → Seller Accepts → Shipping → Delivery → Completed → Escrow
Released → Seller Paid.

## Losing bidder
Wallet reservation released immediately; notified "You have been outbid" or
"Auction ended. Better luck next time" — no money is ever deducted from a
losing bidder.

## Buy Now
Pressing Buy Now instantly closes the auction, confirms the winner, no
further bids allowed.

## Reserve price handling
If Reserve (e.g. ₱500) > Highest Bid (e.g. ₱450) when the auction ends, the
seller may Accept or Reject the highest offer — the auction doesn't
auto-fail, it's the seller's call.

## Status lifecycle
`Draft → Published → Active → Ending Soon → Ended → Awaiting Seller →
Shipping → Delivered → Completed` (or `Cancelled`).

## Payment
Alpha (when enabled): Wallet → Escrow → Delivery → Seller Paid. Beta:
PayMongo → Escrow → Settlement.

## Rating
Buyer rates Seller, Seller rates Buyer — both recorded.
