# RAPEX Docs — Knowledge Base

Start here. This is the full documentation index for the RAPEX repository.

## Overview
- [00_PROJECT_OVERVIEW.md](00_PROJECT_OVERVIEW.md) — what RAPEX is, mission, applications, AI tool responsibilities
- [03_FEATURE_REGISTRY.md](03_FEATURE_REGISTRY.md) — master feature list across the platform
- [05_XANO_PLAN.md](05_XANO_PLAN.md) — Xano backend plan (placeholder until backend design starts)
- [06_FIREBASE_PLAN.md](06_FIREBASE_PLAN.md) — Firebase realtime plan (placeholder until that work starts)

## architecture/
System design, stack decisions, and the full folder-structure blueprint (current + target).

## business/
One document per business rule area (Authentication, Wallet, Orders, Auction, etc.) — the source of truth Xano gets built against.

## development/
How the AI tools (ChatGPT, Claude, Base44, Xano, Firebase) work together, and the step-by-step workflow used for every code change.

## design/
UI guidelines for converting Base44 output into the app folders.

## api/
Xano REST API reference — the frozen Alpha contract (confirmed endpoints/groups, header conventions, known gaps like the rider auth blocker).

## database/
Xano database schema/ERD reference — empty until the backend design conversation happens.

## roadmap/
Build order, MVP target date, and what's explicitly out of scope for this repo.

## testing/
Testing strategy — empty until there's code to test.

## deployment/
Real, current build/CI/staging-deploy status and the exact manual actions still needed — start here for "what actually works right now."

## prompt-library/
Reusable prompts by tool (`chatgpt/`, `claude/`, `base44/`, `gemini/`, `image-prompts/`, `rex-prompt-book/`) — becomes company IP over time.

## meeting-notes/
Dated notes from planning sessions — the record of *why* decisions were made.

## change-log/
[10_CHANGELOG.md](change-log/10_CHANGELOG.md) — dated log of what changed in the repo.

## brand-guidelines/
Brand identity reference — placeholder until the brand is finalized.
