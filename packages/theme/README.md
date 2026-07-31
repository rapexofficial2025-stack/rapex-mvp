# @rapex/theme

Framework-agnostic design tokens shared by every RAPEX app — colors, typography, spacing, radius, shadows, and glass-surface tokens. No React, no React Native, no business logic: pure data, importable from both Expo apps and Vite apps.

## Usage

```ts
import { getTheme } from "@rapex/theme";

const theme = getTheme("light"); // or "dark"
theme.colors.brandPrimary;
theme.spacing.lg;
theme.shadows.md.native; // React Native
theme.shadows.md.css;    // Web
```

## Status
Colors are a **placeholder palette** — swap `src/colors.ts` once official brand guidelines are finalized ([docs/brand-guidelines](../../docs/brand-guidelines/README.md)). Every component in `packages/ui-native` and `packages/ui-web` consumes these semantic tokens, not raw hex values, so a rebrand is a one-file change.
