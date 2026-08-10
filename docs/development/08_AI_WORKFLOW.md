# 08 — AI Workflow

## Pipeline

```
YOU
 │
 ▼
ChatGPT — Architecture
 │
 ▼
Xano — Business Logic
 │
 ▼
Firebase — Realtime Layer
 │
 ▼
Claude — Frontend
 │
 ▼
Base44 — UI
 │
 ▼
Google — QA
```

## Tool responsibilities

| Tool | Responsible for |
|---|---|
| ChatGPT | Architecture, business logic, UI planning, database planning, prompt engineering, product design, folder planning, feature planning, roadmap |
| Xano | Authentication, database, REST API, **all** business logic (orders, wallet, products, auctions, users, merchants, reports) |
| Firebase | Push notifications, Cloud Messaging, presence, live tracking, chat, Cloud Storage, analytics, crash reporting, Remote Config, App Check — realtime/infrastructure only, **never business logic**. See the boundary rule in [../architecture/01_ARCHITECTURE.md](../architecture/01_ARCHITECTURE.md#principles) and [../06_FIREBASE_PLAN.md](../06_FIREBASE_PLAN.md). |
| Claude | Programming — folder structure, React Native, React Web, VS Code work, refactoring, reusable components, best practices, debugging, production code, API integration, GitHub. Frontend wires to Xano for business operations and to Firebase only for realtime communication, keeping Firebase integration modular/replaceable behind its own package. |
| Base44 | UI, components, layouts, navigation, responsive design only |
| Google | QA |

## Working style with Claude
The project owner is a non-programmer founder. Every Claude-driven code change follows this sequence: confirm the task → explain the approach → show the exact folder path → state which files to create/edit/delete/replace → generate complete file content → explain how to run/verify it → explain what happened → wait for confirmation before moving to the next task.

## Status
Living document — update if the division of responsibilities changes.
