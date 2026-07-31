# 06 — Firebase Plan

## Firebase is not the backend

Firebase handles realtime/infrastructure concerns only:
- Push notifications
- Cloud Messaging
- Presence
- Live tracking
- Chat (support chat, in-app messaging, R.E.X. conversation transport — AI decides emotion, app plays the matching animation)
- Cloud Storage
- Analytics
- Crash reporting
- Remote Config
- App Check

**Everything else stays in Xano.** Business rules, validation, authentication workflow, wallet logic, order processing, the auction engine, and financial operations must never live in Firebase — see the Xano boundary in [architecture/01_ARCHITECTURE.md](architecture/01_ARCHITECTURE.md#principles) and the relevant docs in [business/](business/00_OVERVIEW.md).

## Design requirement: modular and replaceable

Firebase integration must be built so it can be swapped out without touching the business layer — i.e. isolated behind `packages/firebase-client` (once that package exists), not called directly from screens/business logic. Frontend talks to **Xano** for business operations and to **Firebase** only for realtime communication.

This doc will track Firebase project setup, collections/paths used for each service above, and security rules once implementation begins.

## Status
Not yet started — scope and boundary rules defined now so implementation starts within the right lines.
