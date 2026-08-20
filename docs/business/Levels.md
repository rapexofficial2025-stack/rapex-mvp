# Levels

Business rules for Levels.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as mobile mockups of a merchant-facing "Build REX" gamified
leveling system — review only until confirmed against real Xano. Not
built anywhere yet.

## "REX" merchant leveling system
Merchants earn **REX Points** by doing normal platform activity, which
levels up their store's mascot ("REX," matching the customer app's own
R.E.X. rabbit mascot — see `apps/customer-app/screens/RexScreen.tsx`)
and unlocks a bigger store visibility radius plus reward crates.

### Earning REX Points
| Activity | Points |
|---|---|
| Upload Product | +5 |
| Complete Order | +10 |
| Engage Customer | +10 |
| Customer Review | +20 |
| Daily Login | +2 |
| Complete Profile | +50 |

### Level progression (reference shows 5 levels)
| Level | Name | Radius | Target Visibility (points) |
|---|---|---|---|
| 1 | Rookie REX | 5 km | 5,000 |
| 2 | Young REX | 10 km | 10,000 |
| 3 | Builder REX | 10 km | 20,000+ |
| 4 | Advanced REX | Locked in reference | — |
| 5 | Elite REX | Locked in reference | — |

Reference explicitly calls out: **"After reaching Level 2, your store's
visibility is now expanded to 10 KM!"** — i.e. level directly gates the
store's real discovery/service radius, not just a cosmetic badge.

### REX "parts" / customization
The mascot is built piece by piece (Head, Ears, Left/Right Arm, Left/Right
Leg) — reference shows some parts unlocked (checkmark) and some locked
(padlock) depending on level, framed as "Earn REX Parts" via completing
activities. Reward crates ("Random REX Parts Crate," opened via an
"Open Crate" button) are teased as the level-up payoff, alongside named
rewards at higher levels (Partnership Perks, Grocery Pack, Sack of Rice).

## Relationship to existing systems
- Distinct from the Admin-side incentive-points/reward-wallet concept
  already scaffolded in `apps/admin-portal/src/features/profile/AdminProfilePage.tsx`
  (Admin Profile tab) — that one is for Admin staff attendance/
  incentives, this one is for Merchant store growth. Don't conflate them.
- Distinct from `docs/business/Rewards.md`'s existing Loyalty/Partnership
  content — reconcile before building; this may be the same system
  described differently, or a genuinely separate merchant-only mechanic.
- No confirmed Xano table for REX points/levels/parts exists yet (check
  `docs/database/data-dictionary.md`'s `xp`/`points_balance`/`level_id`
  fields on the shared Users table — those may already be the intended
  backing fields, unconfirmed).
