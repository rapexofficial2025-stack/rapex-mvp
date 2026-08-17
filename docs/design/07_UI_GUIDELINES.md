# 07 — UI Guidelines

UI for RAPEX is generated in Base44/Gemini/Glide (components, layouts, navigation, responsive design), then converted/wired by Claude into the app folders under `apps/`. These tools never touch backend logic.

This doc will track:
- Design tokens (colors, spacing, typography) once defined
- Component conventions for converting generated output into `src/components/`
- Navigation conventions per app

## Status
In progress — auth-preview, rider-app, and the merchant/admin web portals already have real screens built. Culture/UX principles below apply to all of them.

## Accessibility / clarity rule (applies to every screen, every app)

RAPEX's customer base includes 50+ users with little app experience. The
target is Grab/foodpanda/GCash-level clarity, not Lazada-level button
sprawl (where a tap can lead anywhere and it's unclear why). Concretely:

1. **One primary action per screen.** A single, visually dominant CTA
   button that does the obvious next thing. If a screen seems to need two
   equally-important primary actions, that's a sign it should be two
   screens.
2. **No icon-only buttons for anything that isn't purely decorative.**
   Every button that leads somewhere or does something gets a visible
   label next to (or under) its icon. Icon-only is fine for things like a
   pure "close" X or a map layers toggle — never for navigation or a
   commit action.
3. **Cap secondary actions at ~3 per screen**, and keep them visually
   subordinate (smaller, outlined/ghost style) to the primary CTA so
   there's no ambiguity about what the "main" button is.
4. **Predictable navigation**, not branching menus: a button's label and
   icon should tell you what screen you land on before you tap it. Avoid
   generic "More" hubs that hide several unrelated actions behind one tap.

This is about interaction patterns (button count, label discipline, one
clear next step) — not copying Grab/foodpanda/GCash's actual art, colors,
or branding. RAPEX keeps its own visual identity throughout.
