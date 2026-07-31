# 02 — Folder Structure

```
rapex-mvp/
├── docs/                     # living planning documents (this folder)
└── apps/
    ├── login-module/         # shared authentication flow (React Native)
    ├── customer-app/         # customer-facing marketplace + delivery (React Native)
    ├── rider-app/            # rider delivery app (React Native)
    ├── merchant-portal/      # merchant dashboard (React Web)
    └── admin-portal/         # internal admin dashboard (React Web)
```

Each app will follow this internal structure once code is added (standard for both React Native and React Web apps in this project):

```
src/
├── components/
├── screens/
├── navigation/
├── hooks/
├── services/
├── types/
├── utils/
├── assets/
├── contexts/
└── providers/
```

## Status
Top-level skeleton only. Internal `src/` structure will be created per-app as each app's build begins.
